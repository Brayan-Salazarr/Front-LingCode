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

  private baseUrl = 'http://localhost:8080/api/modules';

  constructor(private http: HttpClient) {}

  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.baseUrl);
  }
  
}