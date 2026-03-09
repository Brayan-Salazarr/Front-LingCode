import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { AuthService, User } from '../../auth/services/authService';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscriptions } from '../../shared/components/subscriptions/subscriptions';
import { UserProgress } from '../../models/progress';
import { ProgressService } from '../../service/progress-service';
import { Observable } from 'rxjs';

//INTERFACES PARA TIPADO
//Representa cada práctica o módulo que el usuario puede realizar
interface Practica {
  modulo: string; //Nombre del módulo
  resultado: string; //Resultado o progreso en porcentaje
  fecha: string; //Fecha de realización
  estado: 'completado' | 'pendiente'; //Estado de la práctica
}

//Representa cada logro o recompensa del usuario
interface Logro {
  icono: string; // URL de la imagen o clase CSS del ícono del logro
  mensaje: string; //Texto descriptivo del logro
  bordeColor: string; //Color del borde para destacar el logro
  classIcon?: string; //Clase CSS opcional para personalizar el ícono 
}

//COMPONENTE PRINCIPAL
@Component({
  selector: 'app-registered-home',
  imports: [Nav, Header, Footer, RouterModule, CommonModule, Subscriptions],
  templateUrl: './registered-home.html',
  styleUrl: './registered-home.css',
})
export class RegisteredHome {

  //Información del usuario actual (puede ser null si no hay usuario logueado)
  user: User | null = null;

  progress$!: Observable<UserProgress | null>;

  constructor(private authService: AuthService, //Servicio de autenticación para obtener el usuario.
    //Router para navegación programática
    private router: Router,

    private progressService: ProgressService
  ) {
    //Nos suscribimos al observable del usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.user = user; //Guardamos los datos del usuario en la variable 'user'
    });
  }

  //DATOS DE PRÁCTICAS
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

  //DATOS DE LOGROS
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
      classIcon: 'icon' //Clase CSS personalizad para este ícono
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


  //MÉTODOS DEL COMPONENTE
  ngOnInit(): void {
    //Si el usuario no está autenticado. redirigimos al login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login-registro'], { queryParams: { view: 'login' } });
      return;
    }


    this.progress$ = this.progressService.progress$;

    //Cada vez que cambie el usuario cargamos su progreso
    this.authService.currentUser$.subscribe(user => {

      //  Cargar progreso inicial
      if (user && user.userId) {

        console.log("USER ID:", user.userId);

        this.progressService.getProgress(user.userId).subscribe();

      }

    })


  }

}
