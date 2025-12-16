import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { routes } from '../app.routes';

@Component({
  selector: 'app-carousel-modules',
  imports: [CommonModule, RouterModule],
  templateUrl: './carousel-modules.html',
  styleUrl: './carousel-modules.css',
})
export class CarouselModules {
  currentIndex = 0;

  items = [
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763695172/mysql-removebg-preview-removebg-preview_2_hc65ln.png', class: 'img1' },
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763696348/Group_25_fnpomn.png', class: 'img2'},
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763696367/Group_31_mmwojn.png', class: 'img3' }
  ];

  setActive(index: number) {
    this.currentIndex = index;
  }
  

  getPosition(index: number) {
    const total = this.items.length;
    const angle = 360 / total;
    const rotate = angle * (index - this.currentIndex);

    return `
      translate(-50%, -50%)
      rotateY(${rotate}deg)
      translateZ(250px)
    `;
  }
}