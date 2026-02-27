import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonService } from '../../service/lessonService';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';


export interface Option {
  text: string;
  correct: boolean;
}

export interface Exercise {
  question: string;
  options: Option[];
}

export interface LessonC {
  id: string;
  moduleId: string;
  title: string;
  xpReward: number;
  isPublished: boolean;
  exercises: Exercise[];
}
@Component({
  selector: 'app-lesson',
  imports: [CommonModule],
  templateUrl: './lesson.html',
  styleUrl: './lesson.css',
})
export class Lesson {

  lesson$!: Observable<LessonC>;
  currentExerciseIndex = 0;
  selectedOption: string | null = null;
  feedback: string = '';
  progressPercent = 0;

  userId = '123'; // luego lo sacas del auth

  constructor(
    private route: ActivatedRoute,
    private lessonService: LessonService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const moduleId = params.get('moduleId');
      if (moduleId) {
        this.lesson$ = this.lessonService.getLessonsByModule(moduleId)
          .pipe(map(data => data[0]));
      }
    });
  }

  selectOption(option: string) {
    this.selectedOption = option;
  }

  submitAnswer(lesson: LessonC) {
    if (!this.selectedOption) return;

    this.lessonService.submitAnswer(this.userId, lesson.id, this.selectedOption)
      .subscribe(res => {
        if (res) {
          this.feedback = "✅ Correcto";
          this.nextExercise(lesson);
        } else {
          this.feedback = "❌ Incorrecto";
        }
      });
  }

  nextExercise(lesson: LessonC) {
    const total = lesson.exercises.length;
    if (this.currentExerciseIndex < total - 1) {
      this.currentExerciseIndex++;
      this.progressPercent = ((this.currentExerciseIndex + 1) / total) * 100;
    } else {
      this.progressPercent = 100;
      this.feedback = "🎉 Lección completada";
    }
  }

  getCurrentExercise(lesson: LessonC): Exercise | null {
  return lesson.exercises?.[this.currentExerciseIndex] ?? null;
}
}
