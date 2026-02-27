//Importaciones necesarias para que el componente funcione
import { Component, input, signal } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';
import { RouterModule } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { CarouselAvatar } from '../../shared/components/carousel-avatar/carousel-avatar';
import { max } from 'rxjs';

/*Interfaz que define la estructura de cada imagen*/
interface ImagenItem {
  nombre: string;
  ruta: string;
  clase: string;
}

@Component({
  selector: 'app-edit-profile',
  imports: [RouterModule, Nav, Footer, NgClass, NgIf, CarouselAvatar],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  selectedAvatarUrl: string | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  errorMessage: string = "";

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file: File = input.files[0];

    this.errorMessage = "";

    //Valida si es imagen
    if (!file.type.startsWith('image/')) {
      this.errorMessage = "Solo se permiten archivos de imagen";
      return;
    }

    //Valida el tamaño de la imagen
    const maxSize = 1*1024*1024;

    if(file.size>maxSize){
      this.errorMessage = "La imagen no puede superar 1 MB";
      return;
    }

    //Mostrar preview
    const reader = new FileReader();
    reader.onload=()=>{
      this.previewUrl=reader.result;
      this.selectedAvatarUrl = null;
    };
    reader.readAsDataURL(file);
  }

  selectAvatar(url: string){
    this.selectedAvatarUrl = url;
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
}