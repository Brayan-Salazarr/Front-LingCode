import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';
import { Header } from '../../shared/components/header/header';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-about-us',
  imports: [Nav, Header, Footer, NgFor, NgClass],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs {
  team = [{
    img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855409/Group_65_fxvots.png', title: 'Alejandro Higuita Díaz', imgAvatar: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855508/image_62_hdqo11.png', text: 'Él se desempeña como Scrum Master del equipo y forma parte del área de backend. Gracias a sus ocurrencias y sentido del humor, contribuye a mantener un ambiente de trabajo agradable y colaborativo, facilitando el desarrollo de las actividades del equipo. Además, se caracteriza por su disposición constante para ayudar y escuchar a todos los integrantes, mostrando empatía y comprensión ante las diferentes situaciones, lo que fortalece la comunicación y el trabajo en equipo.'
  },
  {
    title: 'Laura Aguirre García', imgAvatar: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855755/image_18_mgmxfw.png', text: 'Ella se desempeña como Product Owner del equipo y forma parte del área de front-end. Destaca por su aporte constante de ideas creativas para el diseño, asegurando que las interfaces sean funcionales y atractivas. Además, impulsa al equipo a mantenerse activo y organizado en el cumplimiento de las tareas, velando porque cada actividad se realice correctamente, contribuyendo así a un trabajo colaborativo y eficiente.', img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855794/Group_69_cs83ue.png'
  },
  {
    img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855824/Group_67_e08nz2.png', title: 'Brayan Salazar Sánchez', imgAvatar: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855850/image_30_2_aaebco.png', text: 'Es desarrollador full stack, con un enfoque principal en el front-end. Siempre está dispuesto a ayudar y aportar al equipo en cualquier área que lo necesite, demostrando su compromiso y colaboración. Aunque es una persona reservada, en los momentos cruciales comparte ideas valiosas y soluciones efectivas que marcan la diferencia en el progreso del proyecto.'
  },
  {
    title: 'Daniela Buitrago Fajardo', imgAvatar: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855861/image_17_1_xa7pav.png', text: 'Ella integra el equipo del proyecto LingCode, participando como miembro del grupo durante el desarrollo del aplicativo. Forma parte del proceso de trabajo colaborativo del equipo, acompañando las distintas fases del proyecto y contribuyendo al avance general de las actividades planteadas para su ejecución.', img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765856311/Group_71_k9jstz.png'
  },
  {
    img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855878/Group_68_adjwfr.png', title: 'Santiago Hurtado Marulanda', imgAvatar: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855894/image_9_2_myqaws.png', text: 'Es desarrollador de backend y se destaca por su capacidad de análisis crítico. A través de sus observaciones y aportes, ha contribuido a identificar y mejorar aspectos del proyecto que inicialmente no se habían tenido en cuenta. Además, su enfoque analítico ha permitido detectar oportunidades de optimización y reforzar la toma de decisiones técnicas, contribuyendo así a fortalecer la calidad, estabilidad y solidez del desarrollo del sistema.'
  }
  ]
}