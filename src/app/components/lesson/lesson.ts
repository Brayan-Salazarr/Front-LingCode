import { Component, HostListener, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonService } from '../../service/lessonService';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map, Observable, switchMap, take } from 'rxjs';
import { Nav } from '../../shared/components/nav/nav';
import { FormsModule } from '@angular/forms';
import { UserProgress } from '../../models/progress';
import { ProgressService } from '../../service/progress-service';
import { ModuleService } from '../../service/moduleService';
import { EnergyService } from '../../service/energy-service';
import { SoundService } from '../../service/soundService';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../auth/services/authService';

/*
  Representa una opción de respuesta dentro de un ejercicio.
 */
export interface Option {
  text: string; // Texto que se muestra al usuario
  correct: boolean; // Indica si la opción es correcta
  translation: string;
}

/*
  Representa un ejercicio dentro de una lección.
 */
export interface Exercise {
  question: string; // Pregunta del ejercicio
  description: string;
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

  // Control reactivo del índice de ejercicio
  private exerciseIndex$ = new BehaviorSubject<number>(0);

  // Control reactivo del índice de lección
  currentLesson$!: Observable<LessonC>;

  resetStates() {
    this.isAnswered = false;
    this.selectedOption = null;
    this.selectedWords = [];
    this.isProcessing = false;
  }

  /*ESTADOS DEL EJERCICIO */
  isAnswered = false; // Indica si el ejercicio ya fue respondido
  isCorrectAnswer = false; // Indica si la respuesta fue correcta
  isProcessing = false; // Evita múltiples envíos simultáneos

  selectedLeft: string | null = null; // Palabra seleccionada del lado izquierdo
  shuffledRight: string[] = []; // Lista mezclada del lado derecho

  matchedPairs: MatchPair[] = []; // Pares correctos encontrados
  wrongPair: MatchPair | null = null; // Par incorrecto temporal
  correctPair: MatchPair | null = null; // Par correcto temporal

  /*SISTEMA DE RACHA */
  currentStreak = 0;
  previousStreak = 0;

  progress: any;

  private lessonIndex$ = new BehaviorSubject<number>(0);
  // luego lo sacas del auth

  private energyService = inject(EnergyService);

  energy$ = this.energyService.energy$;
  constructor(
    private route: ActivatedRoute,
    private router: Router, // Permite acceder a parámetros de la URL
    private lessonService: LessonService, // Servicio para comunicarse con el backend
    private progressService: ProgressService,// Servicio que guarda progreso
    private moduleService: ModuleService,
    private soundService: SoundService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  /* PROGRESO DEL MÓDULO*/
  private moduleProgressSubject = new BehaviorSubject<number>(0);
  moduleProgress$ = this.moduleProgressSubject.asObservable();

  /*ACTUALIZA EL PROGRESO DEL MÓDULO*/
  updateProgress(lesson: LessonC) {
    const total = lesson.exercises.length;
    const progress = ((this.currentExerciseIndex + 1) / total) * 100;

    this.moduleProgressSubject.next(progress);
  }

  /*CONFIRMA RESPUESTA Y AVANZA*/
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
    this.resetLessonState();
    this.lesson$ = this.route.paramMap.pipe(
      map(params => params.get('moduleId')!),
      switchMap(moduleId =>
        this.lessonService.getLessonsByModule(moduleId)
      )
    );

    this.progressService.progress$.subscribe(p => {
    this.progress = p;
  });

    /* Obtiene la lección actual combinando
       las lecciones y el índice actual */
    this.currentLesson$ = combineLatest([
      this.lesson$,
      this.lessonIndex$
    ]).pipe(
      map(([lessons, index]) => lessons[index])
    );

    /* Calcula el progreso total del módulo
       teniendo en cuenta todos los ejercicios */
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

    /* Inicializa ejercicios tipo match */
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

    if (this.isProcessing) return;
    this.isProcessing = true;

    const exercise = this.getCurrentExercise(lesson);
    if (!exercise) {
      this.isProcessing = false;
      return;
    }

    // 🔥 MATCH (NO pasa por backend)
    if (exercise.type === 'match' && exercise.pairs) {
      this.handleMatch(lesson);
      return;
    }

    const answer = this.buildAnswer(exercise);

    if (answer === null) {
      this.isProcessing = false;
      return;
    }

    this.lessonService
      .submitAnswer(lesson.id, this.currentExerciseIndex, answer)
      .subscribe({
        next: (res) => this.handleResponse(res, lesson, exercise),
        error: () => this.isProcessing = false
      });
  }

  buildAnswer(exercise: Exercise): string | null {

    switch (exercise.type) {

      case 'multiple':
        return this.selectedOption || null;

      case 'order':
        return this.selectedWords.length
          ? this.selectedWords.join(' ')
          : null;

      case 'translate':
      case 'fill':
        return this.selectedOption?.trim() || null;

      default:
        return '';
    }
  }

  handleResponse(res: boolean, lesson: LessonC, exercise: Exercise) {

    this.isAnswered = true;
    this.isCorrectAnswer = res;

    this.cdr.detectChanges();

    if (res) {
      setTimeout(() => {
        this.nextExercise(lesson);
        this.resetStates();
      }, 800);

    } else {
      this.soundService.playError(); // ❌ sonido centralizado
      this.isProcessing = false;
    }
  }

  handleMatch(lesson: LessonC) {

    const isLast = this.currentExerciseIndex === lesson.exercises.length - 1;

    if (isLast) {
      //this.soundService.playNotification(); // 🎉 final correcto

      this.exerciseIndex$.next(this.currentExerciseIndex + 1);
      this.finishLesson(lesson);

    } else {
      this.nextExercise(lesson);
    }
  }
  /* Mezcla un arreglo aleatoriamente */
  shuffleArray(array: string[]): string[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  selectLeft(word: string) {
    this.selectedLeft = word;
  }

  /*
 Controla la selección del lado derecho
 y valida si el par es correcto.
*/
  selectRight(word: string, lesson: LessonC) {

    if (!this.selectedLeft) return;

    const currentExercise = this.getCurrentExercise(lesson);
    if (!currentExercise || !currentExercise.pairs) return;

    const correctPair = currentExercise.pairs.find(
      p => p.left === this.selectedLeft
    );

    if (correctPair?.right === word) {

      // ✅ CORRECTO
      const pair = {
        left: this.selectedLeft,
        right: word
      };

      this.correctPair = pair; // 👈 activar verde

      this.matchedPairs.push(pair);

      setTimeout(() => {
        this.correctPair = null;
      }, 500);


      // 🔥 EL CAMBIO IMPORTANTE

      if (this.matchedPairs.length === currentExercise.pairs.length) {
        this.isAnswered = true;
      }
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

  /*CONTROL DE ESTADOS MATCH*/
  isLeftDisabled(left: string): boolean {
    return this.matchedPairs.some(m => m.left === left);
  }

  isRightDisabled(right: string): boolean {
    return this.matchedPairs.some(m => m.right === right);
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

    // Reset general de flags de control
    this.isProcessing = false;

    if (this.currentExerciseIndex < total - 1) {

      this.energyService.useEnergy();
      this.currentExerciseIndex++;
      this.exerciseIndex$.next(this.currentExerciseIndex);
      this.selectedOption = null;
      this.feedback = '';

      // Inicializar shuffledRight si es match
      const currentExercise = this.getCurrentExercise(lesson);
      if (currentExercise?.type === 'match' && currentExercise.pairs) {
        this.shuffledRight = this.shuffleArray(
          currentExercise.pairs.map(p => p.right)
        );
        this.matchedPairs = []; // resetear parejas
      }

    } else {

      this.finishLesson(lesson); // 👈 limpio y claro

    }
  }

  /*Finaliza las lecciones*/
  finishLesson(lesson: LessonC) {
    const user = this.authService.getCurrentUser();

    this.soundService.playSuccess();

    this.progressService
      .completeLesson(lesson.id, lesson.xpReward)
      .subscribe(progress => {

        if (user && progress) {
          this.handleStreak(progress);
        }

        console.log("progreso recibido", progress);
      });

    // SIEMPRE navegar (NO dentro del subscribe)
    setTimeout(() => {
      this.router.navigate(['/module-view']);
    }, 800);

    this.moduleService.completeLesson();
  }

  /* Maneja actualización de racha */
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

  /* Animación de racha */
  showStreakAnimation() {
    console.log(`¡Racha de ${this.currentStreak} día!`);
  }

  /*
    Avanza al siguiente ejercicio y actualiza el progreso.
   */
  nextLesson() {

    const currentIndex = this.lessonIndex$.value;

    this.lesson$.pipe(take(1)).subscribe(lessons => {

      if (currentIndex < lessons.length - 1) {

        this.lessonIndex$.next(currentIndex + 1);

        this.currentExerciseIndex = 0;
        this.exerciseIndex$.next(0);
        this.selectedOption = null;
        this.feedback = '';
        this.isProcessing = false;

        this.resetLessonState();

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

  /* Reinicia el estado del ejercicio */
  resetLessonState() {
    this.currentExerciseIndex = 0;
    this.exerciseIndex$.next(0);

    this.selectedOption = null;
    this.selectedWords = [];
    this.matchedPairs = [];
    this.wrongPair = null;
    this.selectedLeft = null;

    this.isAnswered = false;
    this.isCorrectAnswer = false;
    this.isProcessing = false;

    this.feedback = '';
  }

  /*
    Retorna el ejercicio actual según el índice.
   */
  getCurrentExercise(lesson: LessonC): Exercise | null {
    return lesson.exercises?.[this.currentExerciseIndex] ?? null;
  }

  @HostListener('document:keydown.enter')
  handleEnter() {

    if (this.isProcessing) return;

    this.currentLesson$.pipe(take(1)).subscribe(lesson => {

      if (!lesson) return;

      if (this.isAnswered) {
        this.nextExercise(lesson);
      } else {
        this.submitAnswer(lesson);
      }

    });
  }

  goToLesson(lessonId: string, lessons: any) {
    const user = this.authService.getCurrentUser();

  // 🔒 CASO 1: INVITADO
  if (!user) {
    if (lessonId !== lessons[0].id) {
      this.router.navigate(['/register']);
      return;
    }

    // 👇 puede entrar a la primera
    this.router.navigate(['/lesson', lessonId]);
    return;
  }

  // ✅ CASO 2: USUARIO REGISTRADO

  const index = lessons.findIndex((l: LessonC) => l.id === lessonId);

  if (index === 0) {
    this.router.navigate(['/lesson', lessonId]);
    return;
  }

  const previousLesson = lessons[index - 1];

  if (!this.progress?.completedLessons?.includes(previousLesson.id)) {
    return; // 🔒 bloqueado
  }

  this.router.navigate(['/lesson', lessonId]);
  }

  //------------------------------------------
  isLessonUnlocked(lessonId: string, lessons: any[]): boolean {

  const index = lessons.findIndex(l => l.id === lessonId);

  if (index === 0) return true;

  const previousLesson = lessons[index - 1];

  return this.progress?.completedLessons?.includes(previousLesson.id);
}
}
