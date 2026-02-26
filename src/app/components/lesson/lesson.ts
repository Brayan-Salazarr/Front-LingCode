import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonService } from '../../service/lessonService';
import { CommonModule } from '@angular/common';


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

  lesson!: LessonC;
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
      this.loadLesson(moduleId);
    }
  });
}

loadLesson(moduleId: string) {
  this.lessonService.getLessonsByModule(moduleId)
    .subscribe(data => {
      console.log("Lecciones cargadas:", data);
      this.lesson = data[0];
    });
}

  selectOption(option: string) {
    this.selectedOption = option;
  }

  submitAnswer() {
    if (!this.selectedOption) return;

    this.lessonService
      .submitAnswer(this.userId, this.lesson.id, this.selectedOption)
      .subscribe(res => {

        if (res) {
          this.feedback = "✅ Correcto";
          this.nextExercise();
        } else {
          this.feedback = "❌ Incorrecto";
        }
      });
  }

  nextExercise() {

    const total = this.lesson.exercises.length;

    if (this.currentExerciseIndex < total - 1) {
      this.currentExerciseIndex++;
      this.progressPercent =
        ((this.currentExerciseIndex + 1) / total) * 100;
    } else {
      this.progressPercent = 100;
      this.feedback = "🎉 Lección completada";
    }
  }

  get currentExercise() {
    if (!this.lesson || !this.lesson.exercises) {
      return null;
    }
    return this.lesson.exercises[this.currentExerciseIndex];
  }
}
