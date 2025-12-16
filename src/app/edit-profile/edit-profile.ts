import { Component, signal } from '@angular/core';
import { Nav } from '../shared/components/nav/nav';
import { Footer } from '../shared/components/footer/footer';
import { RouterModule } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';

interface ImagenItem {
  nombre: string;
  ruta: string;
  clase: string;
}

@Component({
  selector: 'app-edit-profile',
  imports: [RouterModule, Nav, Footer, NgClass, NgIf],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  // 1. Array de objetos que contiene la información de la imagen
  readonly items: ImagenItem[] = [
    { nombre: 'imagen1', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013632/Group_40_dkpsvv.png', clase: 'img' },
    { nombre: 'imagen2', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013630/Group_34_1_mq8ced.png', clase: 'img' },
    { nombre: 'imagen3', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013629/Group_35_1_bvsgzd.png', clase: 'img' },
    { nombre: 'imagen4', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013627/Group_36_1_m2izro.png', clase: 'img' },
    { nombre: 'imagen5', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013626/Group_37_1_wuuo0j.png', clase: 'img' },
    { nombre: 'imagen6', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013623/Group_38_1_nfsk1i.png', clase: 'img' },
    { nombre: 'imagen7', ruta: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1764013622/Group_39_1_nqqepa.png', clase: 'img' }
  ];

  protected readonly currentIndex = signal<number>(0);

  cambiarImagen() {
    const nextIndex = (this.currentIndex() + 1) % this.items.length;
    this.currentIndex.set(nextIndex);
  }

  cambiarImagenAtras() {
    const prevIndex = (this.currentIndex() - 1 + this.items.length) % this.items.length;
    this.currentIndex.set(prevIndex);
  }

  getTransformForGroup(groupIndex: number): string {
    const cardSpacing = 160;

    const position = groupIndex;

    const translateX = position * cardSpacing;

    const scale = groupIndex === 0 ? 0.9 : 0.9;

    return `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`;
  }

  isModalOpen: boolean = false;
  isAccountDeleted : boolean = false;

  openModal() {
    this.isAccountDeleted = false;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isAccountDeleted = false;
  }

  deleteAccount(){
    this.isAccountDeleted = true;
    setTimeout(()=>{
      this.closeModal();
    }, 3000)
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  isDropdownOpen: boolean = false;

  toggleDropdown(){
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(){
    this.isDropdownOpen = false;
  }
}