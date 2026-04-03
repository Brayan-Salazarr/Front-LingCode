import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LessonC, Exercise, Option, MatchPair } from '../components/lesson/lesson';
import { environment } from '../auth/services/authService';

const EXERCISE_TYPE_MAP: Record<string, string> = {
  'MULTIPLE_CHOICE': 'multiple',
  'MULTIPLE_SELECT': 'multiple',
  'FILL_BLANK': 'fill',
  'TRANSLATION': 'translate',
  'MATCHING': 'match',
  'ORDERING': 'order',
  'CODE_COMPLETION': 'fill',
  'FREE_RESPONSE': 'translate',
  'CODE_REVIEW': 'translate',
};

function mapExercise(raw: any): Exercise {
  const type = EXERCISE_TYPE_MAP[raw.exerciseType] || 'multiple';
  const rawOptions: string[] = raw.options || [];

  let options: Option[] = [];
  let pairs: MatchPair[] | undefined;

  if (raw.exerciseType === 'MATCHING') {
    pairs = rawOptions.map((text: string) => {
      const [left, right] = text.split('|');
      return { left: (left || '').trim(), right: (right || '').trim() };
    });
  } else if (raw.exerciseType === 'ORDERING') {
    options = rawOptions.map((text: string) => {
      const [word, translation] = text.split('|');
      return { text: (word || text).trim(), correct: false, translation: (translation || '').trim() };
    });
  } else {
    options = rawOptions.map((text: string) => ({
      text,
      correct: false,
      translation: ''
    }));
  }

  return {
    id: raw.id,
    type: type as any,
    exerciseType: raw.exerciseType,
    question: raw.question || '',
    questionEs: raw.questionEs,
    description: raw.questionEs || '',
    options,
    pairs,
    correctAnswer: raw.correctAnswer,
    orderIndex: raw.orderIndex,
    hint: raw.hint || null
  };
}

/*
  Interfaz que representa la estructura de una lección
  tal como viene desde el backend (Spring Boot).
  Define los campos que maneja la API.
 */
export interface LessonInte {
  id: string;
  moduleId: string;
  moduleTitle?: string;
  title: string;
  titleEs?: string | null;
  lessonType: string;
  orderIndex: number;
  xpReward: number;
  energyCost: number;
  estimatedMinutes: number;
  premium: boolean;
  exercises: any[];
  progressPercent: number;
}

/*
  Servicio encargado de manejar todas las peticiones HTTP
  relacionadas con las lecciones.
  Se conecta con el backend (Spring Boot)
  para obtener lecciones, enviar respuestas y consultar progreso.
 */
@Injectable({
  providedIn: 'root', // Disponible globalmente en toda la aplicación
})
export class LessonService {
  /*
    URL base del controlador de módulos en el backend.
    Desde aquí se construyen todas las rutas dinámicas.
   */


  private baseUrl = `${environment.apiUrl}/learning`;

  constructor(private http: HttpClient) { }

  /*
   Obtiene todas las lecciones pertenecientes a un módulo específico. 
   @param moduleId ID del módulo
   @returns Observable con un arreglo de lecciones
  */
  getLessonsByModule(moduleId: string): Observable<LessonC[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/modules/${moduleId}/lessons`
    ).pipe(
      map(lessons => lessons.map(lesson => ({
        ...lesson,
        exercises: (lesson.exercises || []).map(mapExercise)
      } as LessonC)))
    );
  }

  /*
    Envía la respuesta de un usuario para una lección específica. 
    @param userId ID del usuario
    @param lessonId ID de la lección
    @param answer Respuesta enviada por el usuario
    @returns Observable boolean indicando si la respuesta fue correcta
   */
  submitAnswer(
    lessonId: string,
    exerciseId: string,
    answer: string
  ): Observable<{ correct: boolean; correctAnswer?: string }> {
    const body = { exerciseId, answer };
    return this.http.post<{ correct: boolean; correctAnswer?: string }>(
      `${this.baseUrl}/exercises/submit`,
      body
    );
  }



}