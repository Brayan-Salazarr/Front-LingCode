import { CommonModule, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AuthService, User } from '../../../auth/services/authService';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-header',
  imports: [NgClass, CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  @Input() title = '';
  @Input() classSpace = '';
  @Input() showTitle = false;
  @Input() showHexagon = false;
  @Input() showHexagon1 = false;
  @Input() showHexagon2 = false;
  @Input() showHexagon3 = false;
  @Input() showHexagon4 = false;
  @Input() showHexagon5 = false;
  @Input() showHexagon6 = false;
  @Input() showHexagon7 = false;
  @Input() showUserInfo = false;
  @Input() showDecorativeCircle = false;
  @Input() showLine = false;
  @Input() variantClass = '';

  @Input() hideTitleWhenLogged = false;
  user$!: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.currentUser$;
  }


}