//Importaciones necesarias para que el componente funcione
import { Component, input, NgModule, signal } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';
import { Router, RouterModule } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { CarouselAvatar } from '../../shared/components/carousel-avatar/carousel-avatar';
import { ChangeDetectorRef } from '@angular/core';
import { max, window } from 'rxjs';
import { AuthService, User } from '../../auth/services/authService';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

/*Interfaz que define la estructura de cada imagen*/
interface ImagenItem {
  nombre: string;
  ruta: string;
  clase: string;
}

@Component({
  selector: 'app-edit-profile',
  imports: [RouterModule, Nav, Footer, NgIf, CarouselAvatar, FormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  caractPassw: boolean = false; //Error cuando la contraseña no cumple requisitos
  errorPassw: boolean = false; //Error cuando las contraseñas no coinciden
  //Datos del formulario del perfil
  fullName: string = ''; //Nombre completo del usuario
  nickName: string = ''; //Alias o apodo del usuario
  email: string = ''; //Correo eléctronico del usuario
  password: string = ''; //Nueva contraseña del usuario
  confirmPass: string = ''; //Confirmación de la contraseña
  isConfirmDisabled: boolean = true; //Controla si el campo de confirmar contraseña esta deshabilitado.

  constructor(private cdr: ChangeDetectorRef, //Permite forzar la actualización de la vista cuando Angular no detecta cambios automáticamente.
    private authService: AuthService,  //Servicio compartido para enviar la imagen seleccionada al componente Nav.
    private router: Router) { }; //Permite redirigir a otras rutas.

  //URL del avatar seleccionado desde las opciones disponibles.
  selectedAvatarUrl: string | null = null;
  //Se guarda la imagen seleccionada por el usuario desde su dispositivo.
  previewUrl: string | null = null;
  //Mensaje para mostrar errores.
  errorMessage: string = "";

  ngOnInit() {
    //Carga los datos del usuario
    const user = this.authService.getCurrentUser();

    if (!user) return;
    //Se asignan los datos del usuario al formulario
    this.fullName = user.fullName;
    this.nickName = user.nickName;
    this.email = user.email;

    //Determina si la imagen del usuario es un avatar(URL) o una imagen personalizada
    if (user.avatar?.startsWith('data:image')) {
      this.previewUrl = user.avatar;
      this.selectedAvatarUrl = null;
    } else {
      this.selectedAvatarUrl = user.avatar ?? null;
      this.previewUrl = null;
    }
  }

  //Método que se ejecuta cuando el usuario selecciona una imagen desde su dispositivo
  onFileSelected(event: Event) {
    //Se obtiene el input que disparo el evento
    const input = event.target as HTMLInputElement;

    //Si no hay archivos seleccionados, se detiene la ejecución
    if (!input.files || input.files.length === 0) {
      return;
    }

    //Se toma el primer archivo seleccionado
    const file: File = input.files[0];

    //Se limpia cualquier mensaje de error anterior
    this.errorMessage = "";

    //Valida si es imagen
    if (!file.type.startsWith('image/')) {
      this.errorMessage = "Solo se permiten archivos de imagen";
      return;
    }

    //Valida el tamaño de la imagen
    const maxSize = 1 * 1024 * 1024;

    //Si la imagen supera el 1 MB entonces se muestra un error
    if (file.size > maxSize) {
      this.errorMessage = "La imagen supera 1 MB";
      return;
    }

    //Si pasa las validaciones, se utiliza FileReader para generar la vista previa
    const reader = new FileReader();
    //Cuando el archivo termina de leerse, se guarda el resultado
    reader.onload = () => {
      //Se verifica que el resultado sea un string 
      if (typeof reader.result === 'string') {
        //Se guarda la imagen para mostrarla en pantalla
        this.previewUrl = reader.result;
        //Se deselecciona el avatar elegido anteriormente 
        this.selectedAvatarUrl = null;

        //Detecta los cambios cuando se selecciona una imagen personalizada
        this.cdr.detectChanges();
      }
    };

    //Convierte la imagen en formato base64 para poder mostrarla en pantalla 
    reader.readAsDataURL(file);

    //Permite seleccionar la misma imagen
    input.value = "";
  }

  //Se ejecuta cuando un usuario selecciona un avatar
  selectAvatar(url: string) {
    //Guarda la URL del avatar seleccionado
    this.selectedAvatarUrl = url;
    //Limpia la imagen subida previamente, si existe
    this.previewUrl = null;
  }

  //Array que contiene todas las imagenes disponibles para el avatar
  readonly items: ImagenItem[] = [
    { nombre: 'imagen1', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013632/Group_40_dkpsvv.png', clase: 'img' },
    { nombre: 'imagen2', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013630/Group_34_1_mq8ced.png', clase: 'img' },
    { nombre: 'imagen3', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013629/Group_35_1_bvsgzd.png', clase: 'img' },
    { nombre: 'imagen4', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013627/Group_36_1_m2izro.png', clase: 'img' },
    { nombre: 'imagen5', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013626/Group_37_1_wuuo0j.png', clase: 'img' },
    { nombre: 'imagen6', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013623/Group_38_1_nfsk1i.png', clase: 'img' },
    { nombre: 'imagen7', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013622/Group_39_1_nqqepa.png', clase: 'img' }
  ];

  //Guarda el índice actual del carrusel
  //Es reactivo: cuando cambia, la vista se actualiza automáticamente
  protected readonly currentIndex = signal<number>(0);

  //Avanza a la siguiente imagen (carrusel hacia adelante)
  cambiarImagen() {
    const nextIndex = (this.currentIndex() + 1) % this.items.length;
    this.currentIndex.set(nextIndex);
  }

  //Regresa a la imagen anterior
  cambiarImagenAtras() {
    const prevIndex = (this.currentIndex() - 1 + this.items.length) % this.items.length;
    this.currentIndex.set(prevIndex);
  }

  /*Calcula la transformación de cada grupo de tarjetas.
  Se usa para posicionarlas horizontalmente y aplicar escala.*/
  getTransformForGroup(groupIndex: number): string {
    const cardSpacing = 160;

    const position = groupIndex;

    const translateX = position * cardSpacing;

    //Escala aplicada
    const scale = groupIndex === 0 ? 0.9 : 0.9;

    return `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`;
  }

  /*MODAL DE ELIMINACIÓN*/
  isModalOpen: boolean = false; //Controla si el modal esta visible
  isAccountDeleted: boolean = false; //Indica si ya se eliminó la cuenta

  //Abre el modal y reinicia el estado
  openModal() {
    this.isAccountDeleted = false; //Indica si la cuenta fue eliminada
    this.isModalOpen = true; //Controla si el modal esta visible
  }

  //Cierra el modal
  closeModal() {
    this.isModalOpen = false;
    this.isAccountDeleted = false;
  }

  //Eliminación la cuenta del usuario
  deleteAccount() {
    this.authService.deleteAccountAuth();

    this.isAccountDeleted = true;

    setTimeout(() => {
      this.closeModal();
      this.router.navigate(['/login-registro']);
    }, 2000)
  }

  //Cierra el modal si se hace click fuera del contenido.
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  /*DROPDOWN DE CONFIGURACIÓN*/
  isDropdownOpen: boolean = false;

  //Alterna entre abrir y cerrar el dropdown.
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  //Cierra manualmente el dropdown.
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  //Valida si las contraseñas coinciden
  passwordValidation(password: string, confirmPassword: string) {
    //Si hay algún error detiene el registro y muestra mensaje al usuario.
    if (!password && !confirmPassword) {
      this.errorPassw = false;
      this.caractPassw = false;
      return;
    }

    //Valida que las contraseñas ingresadas coincidan.
    this.errorPassw = password !== confirmPassword;
  }

  //Verifica si hay texto en el input de contraseña para desbloquear el input de confirmar contraseña.
  confirmDisabled(password: string) {
    this.isConfirmDisabled = password.length === 0;
  }

  //Valida si la contraseña cumple con la cantidad de caracteres solicitados.
  caracterPassword(password: string) {
    if (!password) {
      this.errorPassw = false;
      this.caractPassw = false;
      return;
    }

    //Expresión para validar contraseña.
    //mínimo 8 caracteres, 1 mayúscula y 1 número.
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    //Valida que la contraseña contenga los caracteres adecuados.
    this.caractPassw = !passRegex.test(password);
  }

  //Contiene las dos validaciones para poderlas usar en el HTML.
  onPasswordChange(value: string) {
    this.caracterPassword(value);
    this.confirmDisabled(value);
  }

  //Guarda los cambios de información realizados por el usuario.
  saveChanges() {
    const currentUser = this.authService.getCurrentUser();

    //Si no hay sesión activa, no permite hacer los cambios
    if (!currentUser) {
      this.errorMessage = 'No hay sesión activa';
      return;
    }

    //Determina la imagen final al guardar.
    const finalImage = this.previewUrl || this.selectedAvatarUrl || currentUser?.avatar;

    if (this.password) {
      //Expresión para validar contraseña.
      //mínimo 8 caracteres, 1 mayúscula y 1 número.
      const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      //Valida que la contraseña contenga los caracteres adecuados.
      this.caractPassw = !passRegex.test(this.password);

      if (this.caractPassw) return;

      //Valida que las contraseñas ingresadas coincidan.
      this.errorPassw = this.password !== this.confirmPass;

      if (this.errorPassw) return;
    }

    //Datos del usuario que se actualizan
    //Si el usuario no cambio información, se conserva el valor anterior.
    const updatedUser: Partial<User> = {
      fullName: this.fullName || currentUser.fullName,
      nickName: this.nickName || currentUser.nickName,
      email: this.email || currentUser.email,
      avatar: finalImage
    }

    //Se actualizan los datos.
    const wasUpdate: boolean = this.authService.updateCurrentUser(updatedUser);

    if (!wasUpdate) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: 'Ocurrión un problema al actualizar la información',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    //Limpiar los mensajes de error y campos de contraseña.
    this.caractPassw = false;
    this.errorPassw = false;
    this.errorMessage = '';
    this.password = '';
    this.confirmPass = '';
    
    //Mensaje para el usuario indicando que se actualizaron los datos.
    Swal.fire({
      icon: 'success',
      title: 'Actualizado exitosamente',
      text: 'Tu información ha sido actualizada con éxito',
      confirmButtonText: 'Aceptar',
      scrollbarPadding: false,
      heightAuto: false,
      didClose: () => {
        //Subre el scroll despues de actualizar
        globalThis.scroll({
          top: 0,
          behavior: 'smooth'
        });
      }
    })
  }

  //Indica si la imagen seleccionada es personalizada.
  get isCostumImage(): boolean {
    return this.previewUrl?.startsWith('data:image') ?? false;
  }
}