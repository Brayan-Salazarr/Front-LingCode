import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../auth/services/authService';

/*
  Interfaz que representa la estructura de un módulo
  tal como lo devuelve el backend (Spring Boot). 
  Define todos los campos que componen un módulo educativo
  dentro del sistema.
 */
export interface Module {
  id: string;
  title: string;
  title_es?: string | null;
  description?: string | null;
  description_es?: string | null;
  short_description?: string | null;
  thumbnail_url?: string | null;
  icon_name?: string | null;
  category: string;
  difficulty_level: string;
  estimated_hours?: number | null;
  total_lessons: number;
  total_xp: number;
  display_order: number;
  is_premium: boolean;
  is_published: boolean;
  is_featured: boolean;
  tags: string[];
  progressPercentaje: number;
  prerequisiteModuleIds: string[];
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
  private baseUrl = `${environment.apiUrl}/modules`;

  constructor(private http: HttpClient) { }

  /*
    Obtiene todos los módulos disponibles. 
    @returns Observable con un arreglo de módulos
   */
  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.baseUrl);
  }

  getCurrentStep() {
    return this.currentStep;
  }

  completeLesson() {
    this.currentStep++;
  localStorage.setItem('currentStep', this.currentStep.toString());
  }
}