import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-registro',
  imports: [CommonModule],
  templateUrl: './login-registro.html',
  styleUrl: './login-registro.css',
})
export class LoginRegistro {
  showLogin:Boolean=false;

  toggleAuth():void{
    this.showLogin=!this.showLogin;
  }
}