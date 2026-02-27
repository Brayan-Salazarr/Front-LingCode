import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../auth/services/authService';
import { Module, ModuleService } from '../../service/moduleService';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface Step {
  label: number;
  direction: 'horizontal' | 'vertical';
}
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


  user: User | null = null;
  modules$!: Observable<ModuleViewModel[]>; // ahora vienen del backend
  currentStep = 1;

  constructor(
    public authService: AuthService,
    private moduleService: ModuleService,
    private router: Router
  ) { }

  ngOnInit() {
    this.modules$ = this.moduleService.getModules().pipe(
      map(data =>
        data
          .filter(m => m.is_published)
          .map(module => ({
            ...module,
            image: module.thumbnail_url || '',
            bgImage: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765929029/image-removebg-preview_16_2_ag1deb.png',
            size: '',
            text: 'Progreso',
            progress: 0
          }))
      )
    );
  }
  goToLessons(moduleId: string) {
    this.router.navigate(['/modules', moduleId, 'lessons']);
  }
}