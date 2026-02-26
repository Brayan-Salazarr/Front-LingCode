import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lesson, LessonC } from '../components/lesson/lesson';

export interface LessonService {
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
export class LessonService {
  private baseUrl = 'http://localhost:8080/api/modules';

  constructor(private http: HttpClient) {}

  getLessonsByModule(moduleId: string): Observable<LessonC[]> {
    return this.http.get<LessonC[]>(
      `${this.baseUrl}/${moduleId}/lessons`
    );
  }

  submitAnswer(userId: string, lessonId: string, answer: string) {
    return this.http.post<boolean>(
      `${this.baseUrl}/lessons/${lessonId}/answer?userId=${userId}`,
      answer
    );
  }

  getProgress(userId: string) {
    return this.http.get<any>(
      `${this.baseUrl}/progress?userId=${userId}`
    );
  }

}
