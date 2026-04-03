import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProgress } from '../models/progress';
import { AuthService, environment } from '../auth/services/authService';
import { ProgressResponse } from '../models/progressResponse';


@Injectable({
  providedIn: 'root',
})
export class ProgressService {

  // URL base del backend para el progreso del usuario
  private baseUrl = `${environment.apiUrl}/learning`;


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
    return this.http.get<ProgressResponse>(`${this.baseUrl}/progress/summary`)
      .pipe(
        tap(progress => this.progressSubject.next(progress))
      );
  }

  /*
   Obtiene el progreso de un módulo específico
   Devuelve el porcentaje de progreso del módulo.
  */
  getModuleProgress(userId: string, moduleId: string): Observable<number> {
    return this.http.get<{ content: any[] }>(`${this.baseUrl}/modules`).pipe(
      map(page => {
        const module = page.content?.find((m: any) => m.id === moduleId);
        return module?.userProgress?.progressPercent ?? 0;
      })
    );
  }

  /*
    Marca una lección como completada.
    El backend auto-registra la completación a través del flujo de submitAnswer.
    Aquí refrescamos el progreso actualizado.
   */
  completeLesson(lessonId: string, xp: number): Observable<ProgressResponse | null> {

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.log("Invitado - no se guarda progreso");
      return of(null);
    }

    return this.http.get<ProgressResponse>(`${this.baseUrl}/progress/summary`)
      .pipe(
        tap(progress => {
          this.progressSubject.next(progress);
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
    return this.http.get<{ recentActivity: any[] }>(`${this.baseUrl}/stats`).pipe(
      map(res => (res.recentActivity || []).map(item => ({
        moduleName: item.moduleTitle,
        lessonName: item.lessonTitle,
        progress: 100,
        updatedAt: item.timestamp
      })))
    );
  }
}