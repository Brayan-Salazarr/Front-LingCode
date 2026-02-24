import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-new-password',
  imports: [RouterModule,Nav,Footer],
  templateUrl: './new-password.html',
  styleUrl: './new-password.css',
})
export class NewPassword {

  //Se inyecta el servicio Router para poder navegar entre rutas
  constructor(private router:Router){}

  //método que redirige al usuario a la pantalla de Login
  goLogin() {
    this.router.navigate(
      ['/login-registro'], //Ruta a la que se quiere navegar
      {queryParams:{view: 'login'}} //Parámetros de consulta, se indica que vista se debe mostrar
    );
  }
}