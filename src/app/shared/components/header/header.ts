import { CommonModule, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AuthService, User } from '../../../auth/services/authService';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [NgClass,CommonModule,RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() title = '';
  @Input() classSpace = '';
  @Input() showTitle= false;
  @Input() showHexagon = false;
  @Input() showUserInfo = false;
   @Input() showDecorativeCircle = false;
  @Input() showLine = false;

    user: User | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  get formattedDate(): string {
    if (!this.user) return '';
    return new Date(this.user.createdAt).toLocaleDateString();
  }
}
