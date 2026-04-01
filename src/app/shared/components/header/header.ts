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
  //Texto del título que se mostrará en el header
  @Input() title = '';
  //Clase CSS dinámica para cambiar el diseño del header
  @Input() classSpace = '';
  //Controla si el título debe mostrarse o no
  @Input() showTitle = false;
  //Controla la visibilidad de cada hexágono
  @Input() showHexagon = false;
  @Input() showHexagon1 = false;
  @Input() showHexagon2 = false;
  @Input() showHexagon3 = false;
  @Input() showHexagon4 = false;
  @Input() showHexagon5 = false;
  @Input() showHexagon6 = false;
  @Input() showHexagon7 = false;
  //Define si se muestra la información del usuario logueado
  @Input() showUserInfo = false;
  //Controla la visibilidad del círculo decorativo superior
  @Input() showDecorativeCircle = false;
  //Controla si se muestra la línea decorativa debajo del título
  @Input() showLine = false;
  //Clase adicional para cambiar el estilo de los hexágonos
  @Input() variantClass = '';

  //Oculta el título cuando el usuario está autenticado
  @Input() hideTitleWhenLogged = false;
  //Observable que contiene la información del usuario actual
  user$!: Observable<User | null>;

  //Observable que expone la imagen de perfil del usuario
  profileImage$!: Observable<string | null>;
  //URl del avatar disponible seleccionado por el usuario  
  selectedAvatarUrl: string | null = null;

  constructor(
    private authService: AuthService,
  ) {
    //Obtiene el usuario actual desde el servicio de autenticación
    this.user$ = this.authService.currentUser$;
  }

  //Se guarda la imagen seleccionada por el usuario desde su dispositivo
  previewUrl: string | null = null;
  //Valor actual de la imagen de perfil del usuario
  profileImageValue: string | null = null;

  ngOnInit() {
    //Se suscribe a los cambios del usuario para actualizar la imagen de perfil
    this.user$.subscribe(user => {
      if (user) {
        this.profileImageValue = user.avatar ?? null;
      }
    });
  }

  //Determina si se debe mostrar el circulo de estilo para la imagen personalizada
  get showCircle(): boolean {
    //Si no hay imagen no se muestra
    if (!this.profileImageValue) {
      return false;
    }

    if (this.profileImageValue?.startsWith('data:image') ?? false) {
      return true;
    }
    return false;
  }

  //Indica si la imagen actual es una imagen personalizada (base64 o URL externa)
  get isCostumImage(): boolean {
    return this.showCircle;
  }
  
}