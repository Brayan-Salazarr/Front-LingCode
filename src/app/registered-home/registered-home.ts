import { Component } from '@angular/core';
import { Nav } from '../shared/components/nav/nav';
import { Header } from '../shared/components/header/header';
import { Footer } from '../shared/components/footer/footer';
import { AuthService, User } from '../auth/services/authService';
import { CommonModule } from '@angular/common';

interface Practica {
  modulo: string;
  resultado: string;
  fecha: string;
  estado: 'completado' | 'pendiente';
}

@Component({
  selector: 'app-registered-home',
  imports: [Nav, Header, Footer, CommonModule],
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
      resultado: '75%',
      fecha: '09/12/2026',
      estado: 'completado' // Usaremos esto para el estilo (borde magenta/negro)
    },
    {
      modulo: 'MySQL',
      resultado: '0%',
      fecha: '00/00/0000',
      estado: 'pendiente' // Usaremos esto para el estilo
    }
    // Puedes agregar más objetos aquí y se generarán más tarjetas automáticamente
  ];
}
