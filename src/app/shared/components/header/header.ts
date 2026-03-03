import { CommonModule, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AuthService, User } from '../../../auth/services/authService';
import { AvatarService } from '../../../service/avatarService';
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

  profileImage$!: Observable<string | null>;
  selectedAvatarUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private avatarService: AvatarService
  ) {
    this.profileImage$ = this.avatarService.avatar$;
    //Obtiene el usuario actual desde el servicio de autenticación
    this.user$ = this.authService.currentUser$;
  }

  //Se guarda la imagen seleccionada por el usuario desde su dispositivo
  previewUrl: string | null = null;
  profileImageValue: string | null = null;

  ngOnInit() {
    this.avatarService.avatar$.subscribe(url => {
    this.profileImageValue = url;
      });
  }

  // Getter que sí funciona
  get showCircle(): boolean {
    // Si la URL viene de Cloudinary (avatar), ocultar círculo
    return this.profileImageValue?.startsWith('data:image') ?? false;
  }
}