import { CommonModule, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../auth/services/authService';

@Component({
  selector: 'app-nav',
  imports: [RouterModule, NgClass, CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  @Input() colorBackground = '';

  user: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  goLogin() {
    this.router.navigate(
      ['/login-registro'], { queryParams: { view: 'login' } }
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goHome() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/registered-home']);
    } else {
      this.router.navigate(['/']);
    }
  }

  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}