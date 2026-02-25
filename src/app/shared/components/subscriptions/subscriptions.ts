import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/authService';

@Component({
  selector: 'app-subscriptions',
  imports: [CommonModule, RouterLink],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css',
})
export class Subscriptions {

  //Constructor del componente
  //Router = permite navegar entre páginas
  //AuthService = permite acceder al usuario autenticado
  constructor(
    private router: Router,
    public authService: AuthService
  ) { }

  //Método que se ejecuta cuando el usuario selecciona una suscripción
  handleSubscription() {

    //Se suscribe al observable del usuario actual
    //Esto permite saber si el usuario está logueado o no
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Usuario logueado → ir a pago
        this.router.navigate(['/payment-methods']);
      } else {
        // No logueado → ir a registro
        this.router.navigate(['/login-registro']);
      }
    }).unsubscribe(); //Se cancela la suscripción
  }
}
