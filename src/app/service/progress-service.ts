import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserProgress } from '../models/progress';
import { AuthService } from '../auth/services/authService';



@Injectable({
  providedIn: 'root',
})
export class ProgressService {

  private baseUrl = 'http://localhost:8080/api/progress';


  // 🔥 ESTADO GLOBAL DEL PROGRESO
  private progressSubject = new BehaviorSubject<UserProgress | null>(null);
  progress$ = this.progressSubject.asObservable();

  constructor(private http: HttpClient,
    private authService: AuthService
  ) { }

  // Obtener progreso general
  getProgress(userId: string): Observable<UserProgress> {
    return this.http.get<UserProgress>(`${this.baseUrl}/${userId}`)
      .pipe(
        tap(progress => this.progressSubject.next(progress)) // 🔥 guarda globalmente
      );
  }

  // Obtener progreso por módulo
  getModuleProgress(userId: string, moduleId: string): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/${userId}/modules/${moduleId}`
    );
  }

  completeLesson(lessonId: string, xp: number): Observable<UserProgress> {

    const currentUser = this.authService.getCurrentUser();
    if(!currentUser) throw new Error('No hay usuario logueado')

    return this.http.post<UserProgress>(
      `${this.baseUrl}/${currentUser.userId}/complete/${lessonId}?xp=${xp}`,
      {}
    ).pipe(
      tap(progress => {
        this.progressSubject.next(progress); // 🔥 ACTUALIZA LA RACHA EN TODA LA APP
      })
    );
  }
}
