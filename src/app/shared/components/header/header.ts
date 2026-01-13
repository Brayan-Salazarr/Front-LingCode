import { CommonModule, NgClass } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthService, User } from '../../../auth/services/authService';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [NgClass,CommonModule,RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() classSpace = '';
  @Input() showTitle= false;
  @Input() showHexagon = false;
  @Input() showUserInfo = false;
   @Input() showDecorativeCircle = false;
  @Input() showLine = false;

    user: User | null = null;
    private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  get formattedDate(): string {
    if (!this.user || !this.user.createdAt) return '';
    return new Date(this.user.createdAt).toLocaleDateString();
  }
}
