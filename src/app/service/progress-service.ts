import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProgress } from '../models/progress';



@Injectable({
  providedIn: 'root',
})
export class ProgressService {

  userId=123
  
    private baseUrl = 'http://localhost:8080/api/progress';

  constructor(private http: HttpClient) {}

  // Obtener progreso general
  getProgress(userId: string): Observable<UserProgress> {
    return this.http.get<UserProgress>(`${this.baseUrl}/${userId}`);
  }

  // Obtener progreso por módulo
  getModuleProgress(userId: string, moduleId: string): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/${userId}/modules/${moduleId}`
    );
  }

   completeLesson(userId: string, lessonId: string, xp: number): Observable<UserProgress> {
    return this.http.post<UserProgress>(
      `${this.baseUrl}/${userId}/complete/${lessonId}?xp=${xp}`,
      {}
    );
  }
}
