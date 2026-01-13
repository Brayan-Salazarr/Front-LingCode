import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginRegistro } from '../../../components/login-registro/login-registro'; 

@Component({
  selector: 'app-button',
  imports: [RouterModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  constructor (private router : Router) {}

  toggleAuth(): void {
    this.router.navigate(['/login-registro'])
  }
}
