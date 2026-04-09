import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/authService';

@Component({
  selector: 'app-subscriptions',
  imports: [CommonModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css',
})
export class Subscriptions {

  constructor(
    private router: Router,
    public authService: AuthService
  ) { }

  handleSubscription() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.router.navigate(['/payment-methods'], { queryParams: { plan: 'premium' } });
      } else {
        this.router.navigate(['/login-registro']);
      }
    }).unsubscribe();
  }
}
