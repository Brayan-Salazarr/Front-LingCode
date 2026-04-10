import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../auth/services/authService';
import { Module, ModuleService } from '../../service/moduleService';
import { Router } from '@angular/router';
import { map, switchMap, tap, catchError, timeout, take } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { ProgressService } from '../../service/progress-service';
import { LessonService } from '../../service/lessonService';
import { Lesson } from '../lesson/lesson';
import { Material } from '../../service/material';

/*
  Representa un paso visual en la UI
  (si luego haces navegación tipo roadmap).
 */
interface Step {
  label: number;
  direction: 'horizontal' | 'vertical';
}

/*
  ViewModel extendido del Module. 
  Se utiliza para adaptar los datos del backend
  a las necesidades visuales del frontend.
 */
interface ModuleViewModel extends Module {
  image: string;
  bgImage: string;
  size: string;
  text: string;
  progress: number; // viene del backend si lo tienes
  lessons: any[];
}

@Component({
  selector: 'app-module-view',
  imports: [Nav, Header, Footer, CommonModule],
  templateUrl: './module-view.html',
  styleUrls: ['./module-view.css'],
})
export class ModuleView {

  // Usuario autenticado actualmente
  user: User | null = null;
  // Observable que contiene los módulos adaptados al ViewModel
  modules$!: Observable<ModuleViewModel[]>; // ahora vienen del backend
  // Paso actual (si luego implementas roadmap progresivo)
  currentStep = 1;

  progress: any;

  selectedLessonId: string | null = null;

  loading = true;
  isDownloading = false;

  isGuest = false;
  showLoginModal = false;
  guestCompletedLessons: Set<string> = new Set();

  constructor(
    public authService: AuthService,
    private moduleService: ModuleService,
    private material: Material,
    private progressService: ProgressService,
    private router: Router,
    private lessonService: LessonService
  ) { console.log("Constructor ModuleView"); }

  /*
   Se ejecuta al inicializar el componente. 
   - Consulta los módulos desde el backend
   - Filtra solo los publicados
   - Transforma los datos en un ViewModel para la vista
  */
  ngOnInit() {

    console.log("ngOnInit ejecutado");
    const user = this.authService.getCurrentUser();
    console.log("Usuario:", user);

    this.currentStep = this.moduleService.getCurrentStep();

    this.isGuest = !user;
    if (this.isGuest) {
      const stored = JSON.parse(localStorage.getItem('guestCompletedLessons') || '[]');
      this.guestCompletedLessons = new Set(stored);
    }

    if (user) {
      this.progressService.getProgress(user.userId).subscribe();
    }

    this.progressService.progress$.subscribe(p => {
      this.progress = p;
    });

    this.modules$ = this.moduleService.getModules().pipe(

      map(data => data.filter(m => !m.premium || true)), // backend solo retorna publicados

      switchMap(modules => {

        if (!modules.length) {
          this.loading = false;
          return of([]);
        }

        // 👇 SI NO hay usuario → devolver módulos sin progreso
        if (!user) {
          return forkJoin(
            modules.map(module =>
              this.lessonService.getLessonsByModule(module.id).pipe(
                catchError(() => of([])),
                map(lessons => ({
                  ...module,
                  lessons, // 🔥 AHORA SÍ
                  image: module.thumbnailUrl || '',
                  bgImage: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765929029/image-removebg-preview_16_2_ag1deb.png',
                  size: '',
                  text: 'Progreso',
                  progress: 0
                }))
              )
            )
          );
        }
        return forkJoin(
          modules.map(module =>
            this.lessonService.getLessonsByModule(module.id).pipe(
              catchError(() => of([])),
              map(lessons => ({
                ...module,
                lessons,
                image: module.thumbnailUrl || '',
                bgImage: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765929029/image-removebg-preview_16_2_ag1deb.png',
                size: '',
                text: 'Progreso',
                progress: module.userProgress?.progressPercent ?? 0
              }))
            )
          )
        );
      }),

      tap(result => {
        console.log("FINAL RESULT:", result);
        this.loading = false;
      }),

      catchError(err => {
        console.error("ERROR GLOBAL:", err);
        this.loading = false;
        return of([]);
      })
    );
  }

  finishLesson() {
    this.currentStep = 2; // cuando termine la lección 1
  }

  isLessonCompleted(lessonId: string, module: any): boolean {

    console.log("LESSON ID:", lessonId);
    console.log("COMPLETED:", this.progress?.completedLessons);

    return this.progress?.completedLessons?.map(String).includes(String(lessonId));
  }

  isLessonActive(index: number, lesson: any): boolean {
    return lesson.id === this.selectedLessonId;
  }

  /*
    Navega a la vista de lecciones
    del módulo seleccionado.
   */
  isLessonLockedForGuest(idx: number): boolean {
    return this.isGuest && idx > 0;
  }

  isGuestLessonCompleted(lessonId: string): boolean {
    return this.guestCompletedLessons.has(lessonId);
  }

  handleLessonClick(moduleId: string, lessonId: string, idx: number) {
    if (this.isLessonLockedForGuest(idx)) {
      this.showLoginModal = true;
      return;
    }
    this.goToLesson(moduleId, lessonId);
  }

  goToLogin() {
    this.router.navigate(['/login-registro']);
  }

  goToLesson(moduleId: string, lessonId: string) {

    this.selectedLessonId = lessonId;

    this.router.navigate(
      ['/modules', moduleId, 'lessons'],
      { queryParams: { lessonId } }
    );
  }

  goToLessons(moduleId: string) {
    const user = this.authService.getCurrentUser();
    const progress$ = user
      ? this.progressService.getProgress(user.userId).pipe(catchError(() => of(null)))
      : of(null);

    forkJoin({
      lessons: this.lessonService.getLessonsByModule(moduleId).pipe(take(1), catchError(() => of([]))),
      progress: progress$
    }).subscribe(({ lessons, progress }) => {
      if (!lessons.length) return;

      const completed = (progress?.completedLessons || []).map(String);

      // buscar la PRIMERA lección NO completada
      const nextLesson = lessons.find(
        lesson => !completed.includes(String(lesson.id))
      );

      const lessonToGo = nextLesson || lessons[lessons.length - 1];

      this.router.navigate(
        ['/modules', moduleId, 'lessons'],
        { queryParams: { lessonId: lessonToGo.id } }
      );
    });
  }

  isLineCompleted(index: number, module: any, type: 'before' | 'after'): boolean {
    const lessons = module.lessons;
    const completed = (this.progress?.completedLessons || []).map(String);

    let lastCompletedIndex = -1;

    lessons.forEach((lesson: any, i: number) => {
      if (completed.includes(String(lesson.id))) {
        lastCompletedIndex = i;
      }
    });

    // 🔵 Usuario nuevo
    if (lastCompletedIndex === -1) {
      return type === 'before' && index === 0;
    }

    // 🔵 Líneas ANTES del círculo (inicio)
    if (type === 'before') {
      return index === 0;
    }

    // 🔵 Líneas DESPUÉS del círculo
    return index <= lastCompletedIndex;
  }

  /*
    Genera un arreglo de numeros consecutivos desde el 1 hasta 
    el total de lecciones
  */
  getSteps(totalLessons: number): number[] {
    return Array.from({ length: totalLessons }, (_, i) => i + 1);
  }

  downloadGuie(module: ModuleViewModel) {

    console.log("MODULE RECIBIDO:", module);

    const user = this.authService.getCurrentUser();
    let path = '';

    // 🔎 Construimos el path primero
    if (module.title?.toLowerCase().includes('git')) {
      path = user
        ? 'git/git-guide-full-github.pdf'
        : 'git/git-guide-preview.pdf';
    }

    if (module.title?.toLowerCase().includes('mysql')) {
      path = 'mysql/mysql-guide-full.pdf';
    }

    console.log("PATH FINAL:", path);

    if (!path) {
      console.error("PATH VACÍO ❌");
      return;
    }

    this.isDownloading = true;

    this.material.getDownloadLink(path).subscribe({
      next: (res) => {

        const isPreview = !user;

        if (isPreview) {
          // Solo visualizar
          window.open(res.downloadUrl, '_blank');
        } else {
          // ⬇ Descargar directamente
          const link = document.createElement('a');
          link.href = res.downloadUrl;
          link.download = module.title + '.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        this.isDownloading = false;
      },
      error: (err) => {
        console.error("ERROR BACKEND:", err);
        this.isDownloading = false;
      }
    });
  }
}