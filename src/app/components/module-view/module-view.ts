import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { CommonModule } from '@angular/common';

interface Step {
  label: number;
  direction: 'horizontal' | 'vertical';
}

interface Module {
  image: string;
  bgImage: string;
  title?: string;
  text: string;
  progress: number;
  steps?: Step[]; // Aquí definimos que es un array de objetos
  size?: string;
}
@Component({
  selector: 'app-module-view',
  imports: [Nav, Header, Footer, CommonModule],
  templateUrl: './module-view.html',
  styleUrl: './module-view.css',
})
export class ModuleView {
modules: Module[] = [
    {
      image: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763696348/Group_25_fnpomn.png',
      bgImage: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765929029/image-removebg-preview_16_2_ag1deb.png',
      title: 'Comandos',
      text: 'Progreso',
      progress: 0,
      steps: [
      { label: 1, direction: 'horizontal' },
      { label: 2, direction: 'vertical' } // El 2 baja
    ]
    },
    {

      image: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763695172/mysql-removebg-preview-removebg-preview_2_hc65ln.png',
      bgImage: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765929038/image-removebg-preview_16_1_ava5nx.png',
      title: 'Comandos',
      text: 'Progreso',
      progress: 0,
      steps: [
      { label: 1, direction: 'vertical' }, // El 2 baja (está a la izquierda)
      { label: 2, direction: 'horizontal' }
    ],
      size: 'size-img'
    },
    {
      image: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763696367/Group_31_mmwojn.png',
      bgImage: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765929029/image-removebg-preview_16_2_ag1deb.png',
      text: 'Progreso',
      progress: 0,
      steps: [
      { label: 1, direction: 'horizontal' },
      { label: 2, direction: 'vertical' } // El 2 baja
    ]
    }
  ];
}
