import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [RouterModule, NgClass],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  @Input() colorBackground = '';

  constructor (private router : Router){}

  goLogin() {
    this.router.navigate(
      ['/login-registro'], { queryParams: { view: 'login' } }
    );
  }
}
