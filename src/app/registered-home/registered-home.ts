import { Component } from '@angular/core';
import { Nav } from '../shared/components/nav/nav';
import { Header } from '../shared/components/header/header';
import { Footer } from '../shared/components/footer/footer';
import { AuthService, User } from '../auth/services/authService';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Practica {
  modulo: string;
  resultado: string;
  fecha: string;
  estado: 'completado' | 'pendiente';
}

interface Logro {
  icono: string; // Clase CSS para el ícono (ej: fa-check, fa-fire, ruta de imagen)
  mensaje: string;
  bordeColor: string;
  classIcon?: string; 
}

@Component({
  selector: 'app-registered-home',
  imports: [Nav, Header, Footer, RouterModule, CommonModule],
  templateUrl: './registered-home.html',
  styleUrl: './registered-home.css',
})
export class RegisteredHome {
   user: User | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  practicas: Practica[] = [
    {
      modulo: 'GitHub',
      resultado: '0%',
      fecha: '00/00/0000',
      estado: 'completado'
    },
    {
      modulo: 'MySQL',
      resultado: '0%',
      fecha: '00/00/0000',
      estado: 'pendiente' 
    }
   
  ];

  logros: Logro[] = [
    {
      icono: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765857108/image-removebg-preview_6_1_jcpsse.png', // Asumiendo que usarás algún sistema de íconos o rutas
      mensaje: '¡Cumpliste con el objetivo semanal!',
      bordeColor: '#00ffff'
    },
    {
      icono: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765857109/image-removebg-preview_1_mx3asn.png',
      mensaje: '¡Lograste una racha de 3 días!',
      bordeColor: '#00ffff',
      classIcon: 'icon'
    },
    {
      icono: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765857109/image-removebg-preview_4_1_xggd4v.png',
      mensaje: '¡Completaste el módulo de GitHub!',
      bordeColor: '#00ffff'
    },
    {
      icono: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765857110/image-removebg-preview_5_1_a2scpd.png', 
      mensaje: '¡Hiciste 5 actividades sin errores!',
      bordeColor: '#00ffff'
    }
  ];
}
