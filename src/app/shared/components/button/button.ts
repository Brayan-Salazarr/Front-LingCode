import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginRegistro } from '../../../components/login-registro/login-registro'; 

@Component({
  selector: 'app-button',
  imports: [RouterModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})

//Clase que representa el comportamiento del botón
export class Button {

  //Se inyecta el servicio Router para poder navegar entre páginas
  constructor (private router : Router) {}

  //Método que se ejecuta la hacer clic en el botón
  toggleAuth(): void {
    //Redirige al usuario a la ruta de registro
    this.router.navigate(['/login-registro'])
  }
}
