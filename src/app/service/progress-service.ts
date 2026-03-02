import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  
    private baseUrl = 'http://localhost:8080/api/progress';

  constructor(private http: HttpClient) {}

  // Obtener progreso general
  getProgress(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?userId=${userId}`);
  }

  // Obtener progreso por módulo
  getModuleProgress(userId: string, moduleId: string): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/modules/${moduleId}?userId=${userId}`
    );
  }
}
