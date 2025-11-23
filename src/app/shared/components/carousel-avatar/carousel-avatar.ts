import { Component } from '@angular/core';

@Component({
  selector: 'app-carousel-avatar',
  imports: [],
  templateUrl: './carousel-avatar.html',
  styleUrl: './carousel-avatar.css',
})
export class CarouselAvatar {

  items = [
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763936699/image_17_qj4uj8.png' },
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763936703/image_23_bnz4lm.png' },
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763936706/image_29_xjt6qp.png' },
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763936708/image_47_i2tacp.png' },
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763936711/image_8_gzen7e.png' },
    { img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763936713/image_4_wqq5nm.png' }
  ];

  currentIndex = 1;

  getTransform(index: number) {
    const position = index - this.currentIndex;
    return `translateX(${position * 160}px) scale(${index === this.currentIndex ? 1.2 : 0.9})`;
  }

  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
}
