import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../auth/services/authService';
import { Module, ModuleService } from '../../service/moduleService';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { ProgressService } from '../../service/progress-service';

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

  constructor(
    public authService: AuthService,
    private moduleService: ModuleService,
    private progressService: ProgressService,
    private router: Router
  ) { }

  /*
   Se ejecuta al inicializar el componente. 
   - Consulta los módulos desde el backend
   - Filtra solo los publicados
   - Transforma los datos en un ViewModel para la vista
  */
  ngOnInit() {
    const user = this.authService.getCurrentUser();
    console.log("Usuario actual:", user);
    if (!user) return;

    this.currentStep = this.moduleService.getCurrentStep();

    const userId = user.userId;

    this.modules$ = this.moduleService.getModules().pipe(
      map(data => data.filter(m => m.is_published)),
      switchMap(modules =>
        forkJoin(
          modules.map(module =>
            this.progressService
              .getModuleProgress(userId, module.id)
              .pipe(
                map(progress => ({
                  ...module,
                  image: module.thumbnail_url || '',
                  bgImage: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765929029/image-removebg-preview_16_2_ag1deb.png',
                  size: '',
                  text: 'Progreso',
                  progress: progress
                }))
              )
          )
        )
      )
    );
  }

  finishLesson() {
    this.currentStep = 2; // cuando termine la lección 1
  }

  /*
    Navega a la vista de lecciones
    del módulo seleccionado.
   */
  goToLessons(moduleId: string) {
    this.router.navigate(['/modules', moduleId, 'lessons']);
  }

  getSteps(totalLessons: number): number[] {
    return Array.from({ length: totalLessons }, (_, i) => i + 1);
  }

}