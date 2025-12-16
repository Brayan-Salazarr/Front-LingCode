import { Component } from '@angular/core';
import { Nav } from '../shared/components/nav/nav';
import { Footer } from '../shared/components/footer/footer';
import { NgForOf, NgIf } from '@angular/common';


@Component({
  selector: 'app-help-support',
  imports: [Nav, Footer, NgForOf, NgIf],
  templateUrl: './help-support.html',
  styleUrl: './help-support.css',
})
export class HelpSupport {
  activeIndex: number | null = null;

  GroupBox = [
    {
      mainTitle: 'Cuenta',
      activeIndex: null,
      support: [
        {
          title: '¿Qué es la racha?', answer: 'dfdfsdsds', open: false
        },
        {
          title: '¿Cómo editar mi perfil?', answer: '', open: false
        },
        {
          title: '¿Cómo cerrar sesión?', answer: '', open: false
        }
      ]
    },
    {
      mainTitle: 'Uso de módulos',
      support: [
        {
          title: '¿¿Cómo seleccionar un módulo?', answer: '', open: false
        },
        {
          title: '¿Cómo iniciar una práctica?', answer: '', open: false
        },
        {
          title: '¿Cómo funciona el progreso por módulo?', answer: '', open: false
        }
      ]
    },
    {
      mainTitle: 'Suscripciones',
      support: [
        {
          title: '¿Qué incluye la suscripción básica?', answer: '', open: false
        },
        {
          title: '¿Qué beneficios tiene la suscripción premium?', answer: '', open: false
        },
        {
          title: '¿Cómo suscribirme?', answer: '', open: false
        },
        {
          title: '¿Cómo cancelar o cambiar mi plan?', answer: '', open: false
        }
      ]
    }
  ]
}
