import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserProgress } from '../models/progress';
import { AuthService } from '../auth/services/authService';
import { ProgressResponse } from '../models/progressResponse';


@Injectable({
  providedIn: 'root',
})
export class ProgressService {

  // URL base del backend para el progreso del usuario
  private baseUrl = 'http://localhost:8080/api/progress';


  // Estado global del progreso del usuario en la aplicación
  // BehaviorSubject permite almacenar el progreso actual y emitir cambios
  private progressSubject = new BehaviorSubject<ProgressResponse | null>(null);

  // Observable público para que los componentes puedan suscribirse
  progress$ = this.progressSubject.asObservable();

  constructor(private http: HttpClient,
    private authService: AuthService
  ) { }

  /*
   Obtiene el progreso general del usuario desde el backend
   y actualiza el estado global de la aplicación.
  */
  getProgress(userId: string): Observable<ProgressResponse> {
    return this.http.get<ProgressResponse>(`${this.baseUrl}/${userId}/total`)
      .pipe(
        tap(progress => this.progressSubject.next(progress))
      );
  }

  /*
   Obtiene el progreso de un módulo específico
   Devuelve el porcentaje de progreso del módulo.
  */
  getModuleProgress(userId: string, moduleId: string): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/${userId}/modules/${moduleId}`
    );
  }

  /*
    Marca una lección como completada.
    También suma XP y actualiza el progreso global.
   */
  completeLesson(lessonId: string, xp: number): Observable<ProgressResponse> {

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('No hay usuario logueado')

    return this.http.post<ProgressResponse>(
      `${this.baseUrl}/${currentUser.userId}/complete/${lessonId}?xp=${xp}`,
      {}
    ).pipe(
      tap(progress => {
        this.progressSubject.next(progress); // Actualiza el progreso global en toda la app
      })
    );
  }

  /*
    Reinicia el progreso almacenado en el estado global.
    Se usa normalmente cuando el usuario cierra sesión.
   */
  resetProgress() {
    this.progressSubject.next(null);
  }

  getHistory(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history/${userId}`);
  }
}