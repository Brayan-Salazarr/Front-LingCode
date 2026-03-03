import { CommonModule, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../auth/services/authService';
import { AvatarService } from '../../../service/avatarService';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nav',
  imports: [RouterModule, NgClass, CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  /*Permite recibir una clase o color desde el componente padre para cambiar el fondo del navegador*/
  @Input() colorBackground = '';

  /*Variable que almacena el usuario actual.
  Será null si el usuario no ha iniciado sesión*/
  user: User | null = null;

  profileImage$!: Observable<string | null>;

  constructor(
    private router: Router, //Servicio para navegar entre rutas
    public authService: AuthService, //Servicio de autenticación
    private avatarService: AvatarService
  ) {

    this.profileImage$ = this.avatarService.avatar$;
    /*Se suscribe al observable del usuario actual. Cada vez que el usuario cambia (login/logout), esta variable se actualiza automáticamente*/
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  /*Navega a la página de login. Se envía el parámetro "view=login" para indicar que debe mostrarse la vista de iniciar sesión*/
  goLogin() {
    this.router.navigate(
      ['/login-registro'], { queryParams: { view: 'login' } }
    );
  }

  /*Cierra la sesión del usuario y lo redirige al incio público*/
  logout() {
    this.authService.logout(); //Elimina la sesión del usuario

    //Limpia el avatar guardado
    localStorage.removeItem('avatar');
    this.avatarService.setAvatar(null);

    this.router.navigate(['/']); //Redirige al home público
  }

  /*Navega al home dependiendo si el usuario está autenticado o no*/
  goHome() {
    if (this.authService.isAuthenticated()) {
      /*Si el usuario está autenticado, lo lleva al home de usuarios registrados*/
      this.router.navigate(['/registered-home']);
    } else {
      /*Si no está autenticado, lo lleva al home público*/
      this.router.navigate(['/']);
    }
  }

  /*Controla si el menú tipo hamburguesa está abierto o cerrado*/
  menuOpen = false;

  /*Alterna el estado del menú tipo hamburguesa*/
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  /*Cierra el menú tipo hamburguesa*/
  closeMenu() {
    this.menuOpen = false;
  }
}