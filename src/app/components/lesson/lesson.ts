import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonInte, LessonService } from '../../service/lessonService';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map, Observable, switchMap } from 'rxjs';
import { Nav } from '../../shared/components/nav/nav';
import { FormsModule } from '@angular/forms';
import { UserProgress } from '../../models/progress';
import { ProgressService } from '../../service/progress-service';

/*
  Representa una opción de respuesta dentro de un ejercicio.
 */
export interface Option {
  text: string; // Texto que se muestra al usuario
  correct: boolean; // Indica si la opción es correcta
}

/*
  Representa un ejercicio dentro de una lección.
 */
export interface Exercise {
  question: string; // Pregunta del ejercicio
  options?: Option[];
  type: 'multiple' | 'order' | 'translate' | 'fill' | 'match'; // Lista de opciones disponibles
  pairs?: MatchPair[];
}

export interface MatchPair {
  left: string;
  right: string;
}

/*
  Modelo simplificado de una lección utilizada en el componente.
 */
export interface LessonC {
  id: string;
  moduleId: string;
  title: string;
  xpReward: number;
  isPublished: boolean;
  exercises: Exercise[];
}
@Component({
  selector: 'app-lesson',
  imports: [CommonModule, Nav, FormsModule],
  templateUrl: './lesson.html',
  styleUrl: './lesson.css',
})
export class Lesson {

  // Observable que contiene la lección actual
  lesson$!: Observable<LessonC[]>;
  // Índice del ejercicio actual
  currentExerciseIndex = 0;
  // Opción seleccionada por el usuario
  selectedOption: string | null = null;
  // Mensaje de retroalimentación (correcto / incorrecto)
  feedback: string = '';
  // Porcentaje de progreso de la lección
  progressPercent = 0;

  private exerciseIndex$ = new BehaviorSubject<number>(0);

  currentLesson$!: Observable<LessonC>;


  isAnswered = false;
  isCorrectAnswer = false;

  selectedLeft: string | null = null;
  shuffledRight: string[] = [];

  matchedPairs: MatchPair[] = [];
  wrongPair: MatchPair | null = null;

  currentStreak = 0;
  previousStreak = 0;

  private lessonIndex$ = new BehaviorSubject<number>(0);

  userId = '123'; // luego lo sacas del auth

  constructor(
    private route: ActivatedRoute, // Permite acceder a parámetros de la URL
    private lessonService: LessonService, // Servicio para comunicarse con el backend
    private progressService: ProgressService
  ) { }

  private moduleProgressSubject = new BehaviorSubject<number>(0);
  moduleProgress$ = this.moduleProgressSubject.asObservable();

  updateProgress(lesson: LessonC) {
    const total = lesson.exercises.length;
    const progress = ((this.currentExerciseIndex) / total) * 100;

    this.moduleProgressSubject.next(progress);
  }

  confirmAnswer(lesson: LessonC) {

    if (this.currentExerciseIndex < lesson.exercises.length - 1) {
      this.currentExerciseIndex++;
      this.updateProgress(lesson);
    }
  }

  /*
   Se ejecuta al inicializar el componente.
   Obtiene el moduleId desde la URL
   y carga la primera lección del módulo.
  */
  ngOnInit() {

    this.lesson$ = this.route.paramMap.pipe(
      map(params => params.get('moduleId')!),
      switchMap(moduleId =>
        this.lessonService.getLessonsByModule(moduleId)
      )
    );

    this.currentLesson$ = combineLatest([
      this.lesson$,
      this.lessonIndex$
    ]).pipe(
      map(([lessons, index]) => lessons[index])
    );

    this.moduleProgress$ = combineLatest([
      this.lesson$,
      this.lessonIndex$,
      this.exerciseIndex$
    ]).pipe(
      map(([lessons, lessonIndex, exerciseIndex]) => {

        if (!lessons.length) return 0;

        // Total de ejercicios del módulo
        const totalExercises = lessons.reduce(
          (acc, lesson) => acc + lesson.exercises.length,
          0
        );

        // Ejercicios completados hasta la lección actual
        let completedExercises = 0;

        for (let i = 0; i < lessonIndex; i++) {
          completedExercises += lessons[i].exercises.length;
        }

        // Sumamos el ejercicio actual dentro de la lección
        completedExercises += exerciseIndex;

        return (completedExercises / totalExercises) * 100;
      })
    );

    this.currentLesson$.subscribe(lesson => {

      const currentExercise = this.getCurrentExercise(lesson);

      if (currentExercise?.type === 'match' && currentExercise.pairs) {
        this.shuffledRight = this.shuffleArray(
          currentExercise.pairs.map(p => p.right)
        );
      }

    });

  }
  /*
   Guarda la opción seleccionada por el usuario.
  */
  selectOption(option: string) {
    this.selectedOption = option;
  }

  /*
    Envía la respuesta al backend para validación.
    Muestra retroalimentación según el resultado.
   */
  submitAnswer(lesson: LessonC) {

    const currentExercise = this.getCurrentExercise(lesson);
    if (!currentExercise) return;

    let answer = '';

    if (currentExercise.type === 'multiple') {
      if (!this.selectedOption) return;
      answer = this.selectedOption;
    }

    if (currentExercise.type === 'order') {
      answer = this.selectedWords.join(' ');
    }

    if (currentExercise.type === 'translate' || currentExercise.type === 'fill') {
      if (!this.selectedOption) return;
      answer = this.selectedOption;
    }

    if (currentExercise.type === 'match' && currentExercise.pairs) {
      this.shuffledRight = this.shuffleArray(
        currentExercise.pairs.map(p => p.right)
      );
    }

    this.lessonService
      .submitAnswer(
        this.userId,
        lesson.id,
        this.currentExerciseIndex,
        answer
      )
      .subscribe(res => {

        this.isAnswered = true;
        this.isCorrectAnswer = res;

        if (res) {
          setTimeout(() => {
            this.nextExercise(lesson);
            this.isAnswered = false;
            this.selectedOption = null;
            this.selectedWords = [];
          }, 800);
        }
      });
  }

  shuffleArray(array: string[]): string[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  selectLeft(word: string) {
    this.selectedLeft = word;
  }
  selectRight(word: string, lesson: LessonC) {

    if (!this.selectedLeft) return;

    const currentExercise = this.getCurrentExercise(lesson);
    if (!currentExercise || !currentExercise.pairs) return;

    const correctPair = currentExercise.pairs.find(
      p => p.left === this.selectedLeft
    );

    if (correctPair?.right === word) {

      // ✅ CORRECTO
      this.matchedPairs.push({
        left: this.selectedLeft,
        right: word
      });

    } else {

      // ❌ INCORRECTO
      this.wrongPair = {
        left: this.selectedLeft,
        right: word
      };

      setTimeout(() => {
        this.wrongPair = null;
      }, 800);
    }

    this.selectedLeft = null;
  }

  isWrongLeft(word: string): boolean {
    return !!this.wrongPair && this.wrongPair.left === word;
  }

  isWrongRight(word: string): boolean {
    return !!this.wrongPair && this.wrongPair.right === word;
  }

  /*Controla los estados de los ejercicios*/
  nextExercise(lesson: LessonC) {
    const total = lesson.exercises.length;

    if (this.currentExerciseIndex < total - 1) {

      this.currentExerciseIndex++;
      this.exerciseIndex$.next(this.currentExerciseIndex);
      this.selectedOption = null;
      this.feedback = '';

    } else {

      this.finishLesson(lesson); // 👈 limpio y claro

    }
  }

  finishLesson(lesson: LessonC) {

    this.previousStreak = this.currentStreak;

    this.progressService
      .completeLesson(this.userId, lesson.id, lesson.xpReward)
      .subscribe(progress => {

        this.handleStreak(progress);

        this.goToNextLesson(); // 👈 aquí sí

      });
  }

  handleStreak(progress: UserProgress) {

    this.currentStreak = progress.currentStreak;

    if (this.currentStreak > this.previousStreak) {
      this.showStreakAnimation();
    }
  }

  goToNextLesson() {

    this.currentExerciseIndex = 0;
    this.exerciseIndex$.next(0);
    this.selectedOption = null;
    this.feedback = '';

    this.nextLesson(); // 👈 solo si nextLesson SOLO cambia la lección
  }

  showStreakAnimation() {
    alert(`🔥 ¡Racha de ${this.currentStreak} días!`);
  }

  /*
    Avanza al siguiente ejercicio y actualiza el progreso.
   */
  nextLesson() {

    const currentIndex = this.lessonIndex$.value;

    this.lesson$.subscribe(lessons => {

      if (currentIndex < lessons.length - 1) {

        this.lessonIndex$.next(currentIndex + 1);

        this.currentExerciseIndex = 0;
        this.exerciseIndex$.next(0);
        this.selectedOption = null;
        this.feedback = '';

      } else {
        this.feedback = "🎉 Módulo completado";
      }

    }).unsubscribe();
  }

  selectedWords: string[] = [];

  addWord(word: string) {
    if (!this.selectedWords.includes(word)) {
      this.selectedWords.push(word);
    }
  }

  removeWord(word: string) {
    this.selectedWords = this.selectedWords.filter(w => w !== word);
  }

  /*
    Retorna el ejercicio actual según el índice.
   */
  getCurrentExercise(lesson: LessonC): Exercise | null {
    return lesson.exercises?.[this.currentExerciseIndex] ?? null;
  }

}
