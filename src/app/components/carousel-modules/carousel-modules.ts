//Importaciones para que el componente funcione
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Route, Router, RouterModule } from "@angular/router";
import { routes } from '../../app.routes';

@Component({
  selector: 'app-carousel-modules',
  imports: [CommonModule, RouterModule],
  templateUrl: './carousel-modules.html',
  styleUrl: './carousel-modules.css',
})
export class CarouselModules {
  //Se inyecta el servicio Router para poder navegar entre páginas
  constructor(private router: Router) { }

  //Índice de la tarjeta actualmente activa
  currentIndex = 0;

  //Arreglo que contiene las imagenes del carrusel
  //Cada objeto tiene tiene la URL de la imagen y una clase personalizada
  items = [
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763695172/mysql-removebg-preview-removebg-preview_2_hc65ln.png', class: 'img1', router: '/module-view' },
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763696348/Group_25_fnpomn.png', class: 'img2', router: '/module-view' },
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1775772841/Group_31_1_n9fipj.png', class: 'img3', router: '/module-view' }
  ];

  //Método que cambia la tarjeta activa cuando se hace clic
  setActive(index: number) {
    if (this.currentIndex === index) {
      this.router.navigate(['/module-view']);
      return;
    }

    this.currentIndex = index;
  }

  //Calcula la posición de cada tarjeta
  //Genera un efecto de rotación en círculo, tipo carrusel
  getPosition(index: number) {
    const total = this.items.length;//Cantidad total de tarjetas
    const angle = 360 / total;//Divide el círculo completo entre las tarjetas

    let diff = index - this.currentIndex;

    // Hace que el carrusel sea circular
    if (diff > total / 2) {
      diff -= total;
    } else if (diff < -total / 2) {
      diff += total;
    }

    const rotate = angle * diff;
    
    return `
      translate(var(--x-offset, -50%), var(--y-offset, -50%))
      rotateY(${rotate}deg)
      translateZ(var(--tz, 250px))
    `;
    /*
    translate → centra la tarjeta
      rotateY → rota en el eje Y (efecto 3D horizontal)
      translateZ → la acerca o aleja para crear profundidad
    */
  }
}