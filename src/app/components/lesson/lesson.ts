import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonInte, LessonService } from '../../service/lessonService';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map, Observable, switchMap } from 'rxjs';
import { Nav } from '../../shared/components/nav/nav';

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
  options: Option[]; // Lista de opciones disponibles
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
  imports: [CommonModule, Nav],
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

  currentLesson$!: Observable<LessonC>;

  moduleProgress$!: Observable<number>;

  private lessonIndex$ = new BehaviorSubject<number>(0);

  userId = '123'; // luego lo sacas del auth

  constructor(
    private route: ActivatedRoute, // Permite acceder a parámetros de la URL
    private lessonService: LessonService // Servicio para comunicarse con el backend
  ) { }

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
  this.lessonIndex$
]).pipe(
  map(([lessons, index]) =>
    lessons.length === 0
      ? 0
      : ((index + 1) / lessons.length) * 100
  )
);
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
    if (!this.selectedOption) return;

    this.lessonService
      .submitAnswer(this.userId, lesson.id, this.selectedOption)
      .subscribe(res => {
        if (res) {
          this.feedback = "✅ Correcto";
          this.nextExercise(lesson);
        } else {
          this.feedback = "❌ Incorrecto";
        }
      });
  }
  /*Controla los estados de los ejercicios*/
  nextExercise(lesson: LessonC) {
    const total = lesson.exercises.length;

    if (this.currentExerciseIndex < total - 1) {
      this.currentExerciseIndex++;
      this.selectedOption = null;
    }
  }

  /*
    Avanza al siguiente ejercicio y actualiza el progreso.
   */
nextLesson() {

  this.lesson$.pipe().subscribe(lessons => {

    const currentIndex = this.lessonIndex$.value;

    if (currentIndex < lessons.length - 1) {

      this.lessonIndex$.next(currentIndex + 1);

      this.currentExerciseIndex = 0;
      this.selectedOption = null;
      this.feedback = '';

    } else {
      this.feedback = "🎉 Módulo completado";
    }

  });
}

  /*
    Retorna el ejercicio actual según el índice.
   */
  getCurrentExercise(lesson: LessonC): Exercise | null {
    return lesson.exercises?.[this.currentExerciseIndex] ?? null;
  }

}
