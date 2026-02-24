import { HttpClient } from '@angular/common/http';
import { Injectable, Input } from '@angular/core';
import { Observable } from 'rxjs';

export interface Lesson {
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
  updated_at?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class Lesson {
   @Input() lesson!: Lesson;


    constructor(private http: HttpClient) {}

  getLessonsByModule(moduleId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`/api/modules/${moduleId}/lessons`);
  }

  // Ejemplo para mostrar título según idioma (puedes extender para multiidioma)
  getTitle(lang: 'en' | 'es'): string {
    if (lang === 'es' && this.lesson.title_es) return this.lesson.title_es;
    return this.lesson.title;
  }


}
