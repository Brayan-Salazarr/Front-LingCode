//Importaciones necesarias para que el componente funcione
import { Component, input, NgModule, signal } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';
import { RouterModule } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { CarouselAvatar } from '../../shared/components/carousel-avatar/carousel-avatar';
import { ChangeDetectorRef } from '@angular/core';
import { max, window } from 'rxjs';
import { AvatarService } from '../../service/avatarService';
import { AuthService } from '../../auth/services/authService';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../service/user-service';

/*Interfaz que define la estructura de cada imagen*/
interface ImagenItem {
  nombre: string;
  ruta: string;
  clase: string;
}

@Component({
  selector: 'app-edit-profile',
  imports: [RouterModule, Nav, Footer, NgClass, NgIf, CarouselAvatar, FormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  caractPassw: boolean = false; //Error cuando la contraseña no cumple requisitos
  errorPassw: boolean = false; //Error cuando las contraseñas no coinciden
  fullName: string = '';
  nickName: string = '';
  email: string = '';
  password: string = '';
  confirmPass: string = '';

  constructor(private cdr: ChangeDetectorRef, //Permite forzar la actualización de la vista cuando Angular no detecta cambios automáticamente
    private avatarService: AvatarService,
    private userService: UserService) { }; //Servicio compartido para enviar la imagen seleccionada al componente Nav

  //URL del avatar seleccionado desde las opciones disponibles
  selectedAvatarUrl: string | null = null;
  //Se guarda la imagen seleccionada por el usuario desde su dispositivo
  previewUrl: string | null = null;
  //Mensaje para mostrar errores
  errorMessage: string = "";

  ngOnInit() {
    //Carga los datos del usuario
    const user = this.userService.getCurrentUser();
    this.fullName = user.fullName;
    this.nickName = user.nickName;
    this.email = user.email;
    this.password = user.password;
    this.previewUrl = user.avatar ?? null;
    this.selectedAvatarUrl = user.avatar ?? null;


    this.avatarService.avatar$.subscribe(currentAvatar => {
      if (!currentAvatar) return;

      if (currentAvatar.startsWith('data:image')) {
        this.previewUrl = currentAvatar;
        this.selectedAvatarUrl = null;
      } else {
        this.selectedAvatarUrl = currentAvatar;
        this.previewUrl = null;
      }

    });
  }

  //Método que se ejecuta cuando el usuario selecciona un archivo
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

    //Si la imagen supera el peso entonces se muestra un error
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
    this.isAccountDeleted = false;
    this.isModalOpen = true;
  }

  //Cierra el modal
  closeModal() {
    this.isModalOpen = false;
    this.isAccountDeleted = false;
  }

  //Simula la eliminación de la cuenta
  deleteAccount() {
    this.isAccountDeleted = true;
    setTimeout(() => {
      //Cierra automáticamente después de 3 segundos
      this.closeModal();
    }, 3000)
  }

  //Cierra el modal si se hace click fuera del contenido
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  /*DROPDOWN DE CONFIGURACIÓN*/
  isDropdownOpen: boolean = false;

  //Alterna entre abrir y cerrar el dropdown
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  //Cierra manualmente el dropdown
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  //Guarda los cambios de información realizados por el usuario 
  saveChanges() {
    const currentUser = this.userService.getCurrentUser();

    const finalImage = this.previewUrl || this.selectedAvatarUrl || currentUser.avatar;
    if (finalImage) {
      this.avatarService.setAvatar(finalImage);

      //Expresión para validar contraseña
      //mínimo 8 caracteres, 1 mayúscula y 1 número
      if (this.password) {
        const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        //Valida que la contraseña contenga los caracteres adecuados.
        this.caractPassw = !passRegex.test(this.password);

        if (this.caractPassw) {
          return;
        }
      }

      const updatedUser = {
        //Si el usuario deja campos vacíos, se usan los datos o valores anteriores
        fullName: this.fullName || currentUser.fullName,
        nickName: this.nickName || currentUser.nickName,
        email: this.email || currentUser.email,
        password: this.password || currentUser.password,
        avatar: finalImage
      };

      this.userService.updateUser(updatedUser);

      this.avatarService.setAvatar(finalImage);

      //Mensaje para el usuario indicando que se actualizaron los datos
      alert('Actualizado exitosamente');

      //Después de guardar la información el scroll sube
      globalThis.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }
  }

  //Valida si las contraseñas coinciden
  passwordValidation(password: string, confirmPassword: string) {
    //Si hay algún error detiene el registro y muestra mensaje al usuario
    if (!password && !confirmPassword) {
      this.errorPassw = false;
      return;
    }

    //Valida que las contraseñas ingresadas coincidan
    this.errorPassw = password !== confirmPassword;
  }

  //Valida si la contraseña cumple con la cantidad de caracteres solicitados
  caracterPassword(password: string) {
    //Expresión para validar contraseña
    //mínimo 9 caracteres, 1 mayúscula y 1 número
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    //Valida que la contraseña contenga los caracteres adecuados.
    this.caractPassw = !passRegex.test(password);
  }
}