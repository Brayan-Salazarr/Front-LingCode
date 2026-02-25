import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
  prerequisiteModuleIds: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ModuleService {

 /*  // 🔥 Datos de prueba (mientras no tengas backend)
  private modules: Module[] = [
    {
      id: '1',
      title: 'Fundamentos',
      description: 'Conceptos básicos',
      order_index: 1,
      is_published: true
    },
    {
      id: '2',
      title: 'Intermedio',
      description: 'Conceptos más avanzados',
      order_index: 2,
      is_published: true
    }
  ];

  getModules(): Observable<Module[]> {
    return of(this.modules);
  }*/

  private baseUrl = '/api/modules';

  constructor(private http: HttpClient) {}

  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.baseUrl);
  }
  
}