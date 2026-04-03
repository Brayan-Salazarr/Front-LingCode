import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/*
  Interfaz que representa la estructura de un módulo
  tal como lo devuelve el backend (Spring Boot). 
  Define todos los campos que componen un módulo educativo
  dentro del sistema.
 */
export interface Module {
  id: string;
  title: string;
  titleEs?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  thumbnailUrl?: string | null;
  iconName?: string | null;
  category: string;
  difficultyLevel: string;
  estimatedHours?: number | null;
  totalLessons: number;
  totalXp: number;
  premium: boolean;
  featured: boolean;
  tags: string[];
  prerequisiteModuleIds: string[];
  userProgress?: {
    completedLessons: number;
    totalLessons: number;
    progressPercent: number;
    xpEarned: number;
  } | null;
}

/*
  Servicio encargado de gestionar las operaciones
  relacionadas con los módulos. 
  Se comunica con el backend para obtener la información
  de los módulos disponibles en el sistema.
 */
@Injectable({
  providedIn: 'root', // Disponible globalmente en toda la aplicación
})
export class ModuleService {

  currentStep = Number(localStorage.getItem('currentStep')) || 1;
  /*
    URL base del endpoint del backend.
    Todas las peticiones relacionadas con módulos
    se construyen a partir de esta ruta.
   */
  private baseUrl = `${environment.apiUrl}/learning/modules`;

  constructor(private http: HttpClient) { }

  /*
    Obtiene todos los módulos disponibles. 
    @returns Observable con un arreglo de módulos
   */
  getModules(): Observable<Module[]> {
    return this.http.get<{ content: Module[] }>(this.baseUrl).pipe(
      map(page => page.content)
    );
  }

  getCurrentStep() {
    return this.currentStep;
  }

  completeLesson() {
    this.currentStep++;
  localStorage.setItem('currentStep', this.currentStep.toString());
  }
}