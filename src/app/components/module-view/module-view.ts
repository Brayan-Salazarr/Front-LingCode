import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../auth/services/authService';
import { Module, ModuleService } from '../../service/moduleService';
import { Router } from '@angular/router';

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
  styleUrl: './module-view.css',
})
export class ModuleView {


  user: User | null = null;
  modules: ModuleViewModel[] = []; // ahora vienen del backend

  //CONFIGURACIÓN VISUAL (SOLO FRONT)
  visualConfig = [
    {
      image: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763696348/Group_25_fnpomn.png',
      bgImage: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765929029/image-removebg-preview_16_2_ag1deb.png',
      size: '',
    },
    {
      image: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763695172/mysql-removebg-preview-removebg-preview_2_hc65ln.png',
      bgImage: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765929038/image-removebg-preview_16_1_ava5nx.png',
      size: 'size-img',
    },
    {
      image: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763696367/Group_31_mmwojn.png',
      bgImage: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765929029/image-removebg-preview_16_2_ag1deb.png',
      size: '',
    }
  ];

  constructor(
    public authService: AuthService,
    private moduleService: ModuleService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

currentStep = 1;

  ngOnInit(): void {
    this.moduleService.getModules().subscribe(data => {

      const published = data.filter(m => m.is_published);

      this.modules = published.map((module, index) => ({
        ...module,

        // 🎨 solo visual
        image: this.visualConfig[index]?.image || '',
        bgImage: this.visualConfig[index]?.bgImage || '',
        size: this.visualConfig[index]?.size || '',
        text: 'Progreso',

        // 👇 si el backend no manda progreso aún
        progress: 0
      }));

    });
  }

  goToLessons(moduleId: string) {
    this.router.navigate(['/modules', moduleId, 'lessons']);
  }
}