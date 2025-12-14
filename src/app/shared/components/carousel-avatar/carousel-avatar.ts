import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface ImagenItem {
  nombre: string;
  ruta: string;
  clase: string;
}
@Component({
  selector: 'app-carousel-avatar',
  imports: [CommonModule, RouterModule],
  templateUrl: './carousel-avatar.html',
  styleUrl: './carousel-avatar.css',
})
export class CarouselAvatar {

  constructor(private router: Router) { }

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

  // 2. Signal que almacena el ÍNDICE de la imagen activa
  protected readonly currentIndex = signal<number>(0); // Empieza en 0 (imagen1)

  // 3. Lógica simplificada para cambiar la imagen (funciona como un bucle)
  cambiarImagen() {
    const nextIndex = (this.currentIndex() + 1) % this.items.length;
    this.currentIndex.set(nextIndex);
  }

  // Opcional: Para ir hacia atrás
  cambiarImagenAtras() {
    const prevIndex = (this.currentIndex() - 1 + this.items.length) % this.items.length;
    this.currentIndex.set(prevIndex);
  }

  getTransformForGroup(groupIndex: number): string {
    // Ajusta estos valores según el tamaño de tus tarjetas y el espaciado
    const cardSpacing = 160;

    // Posición del elemento: 0 (centro), 1 (derecha), 2 (más a la derecha/wrap)
    const position = groupIndex;

    const translateX = position * cardSpacing;

    // Escala: Si estás en la posición 0 del grupo (el principal), escala 1.2, si no 0.9
    const scale = groupIndex === 0 ? 0.9 : 0.9;

    // Combinamos las transformaciones
    return `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`;
  }

  toggleAuth(): void {
    this.router.navigate(['/login-registro'])
  }
}
