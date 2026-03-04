import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lesson, LessonC } from '../components/lesson/lesson';

/*
  Interfaz que representa la estructura de una lección
  tal como viene desde el backend (Spring Boot).
  Define los campos que maneja la API.
 */
export interface LessonInte {
  id: string;
  module: string;
  title: string;
  title_es?: string | null;
  description?: string | null;
  description_es?: string | null;
  lesson_type: string;
  content_id?: string | null;
  video_url?: string | null;
  order_index: number;
  xp_reward: number;
  energy_cost: number;
  estimated_minutes: number;
  is_premium: boolean;
  is_published: boolean;
  exercises: any[];
  created_at?: Date;
  progressPercent: number;
  updated_at?: Date;
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


  private baseUrl = 'http://localhost:8080/api/modules';

  constructor(private http: HttpClient) { }

  /*
   Obtiene todas las lecciones pertenecientes a un módulo específico. 
   @param moduleId ID del módulo
   @returns Observable con un arreglo de lecciones
  */
  getLessonsByModule(moduleId: string): Observable<LessonC[]> {
    return this.http.get<LessonC[]>(
      `${this.baseUrl}/${moduleId}/lessons`
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
    exerciseIndex: number,
    answer: string
  ): Observable<boolean> {

    return this.http.post<boolean>(
      `${this.baseUrl}/lessons/${lessonId}/answer`,
      {
        exerciseIndex,
        answer
      }
    );
  }


  /*
    Consulta el progreso general del usuario. 
    @param userId ID del usuario
    @returns Observable con la información del progreso
   */
  getProgress(userId: string) {
    return this.http.get<any>(
      `${this.baseUrl}/progress?userId=${userId}`
    );
  }

}
