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
constructor(
  private router: Router,
  public authService: AuthService
) {}

handleSubscription() {
  this.authService.currentUser$.subscribe(user => {
    if (user) {
      // Usuario logueado → ir a pago
      this.router.navigate(['/payment-methods']);
    } else {
      // No logueado → ir a registro
      this.router.navigate(['/login-registro']);
    }
  }).unsubscribe();
}
}
