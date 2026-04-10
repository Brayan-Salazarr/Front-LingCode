import { Component } from '@angular/core';
//Importación de los componentes compartidos que se usarán en la vista.
//Nav: barra de navegación.
//Header: Encabezado de la página.
//Footer: Pie de página.
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';
import { Header } from '../../shared/components/header/header';
//Importación de directivas de Angular.
//Ngfor: Permite recorrer listas en el HTML (*ngFor).
//Ngclass: Permite agregar clases CSS dinámicamente. 
import { NgClass, NgFor } from '@angular/common';

@Component({
  //Selector del componente, se usa en el HTML como <app-about-us>
  selector: 'app-about-us',
  //Componente y directivas que este componente puede usar en su template
  imports: [Nav, Header, Footer, NgFor, NgClass],
  //Archivo HTML que contiene la estructura visual del componente
  templateUrl: './about-us.html',
  //Archivo CSS que contiene los estilos del componente
  styleUrl: './about-us.css',
})
export class AboutUs {
  //Arreglo que contiene la información de los integrantes del equipo.
  //Este arreglo se usa en el HTML con *ngFor para mostrar cada miembro dinámicamente. 
  team = [

    //Integrante 1
    {
      //Imagen decorativa o de fondo asociada al integrante.
      img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1772731390/Alejo_miunci.jpg', 
      //Nombre completo del integrante.
      title: 'Alejandro Higuita Díaz', 
      //Imagen de perfil (avatar)
      imgAvatar: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855508/image_62_hdqo11.png', 
      //Descripción del rol y aporte dentro del equipo.
      text: 'Él se desempeña como Scrum Master del equipo y forma parte del área de backend. Gracias a sus ocurrencias y sentido del humor, contribuye a mantener un ambiente de trabajo agradable y colaborativo, facilitando el desarrollo de las actividades del equipo. Además, se caracteriza por su disposición constante para ayudar y escuchar a todos los integrantes, mostrando empatía y comprensión ante las diferentes situaciones, lo que fortalece la comunicación y el trabajo en equipo.'
    },
    {
     //Integrante 2 
      title: 'Laura Aguirre García', imgAvatar: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855755/image_18_mgmxfw.png', text: 'Ella se desempeña como Product Owner del equipo y forma parte del área de front-end. Destaca por su aporte constante de ideas creativas para el diseño, asegurando que las interfaces sean funcionales y atractivas. Además, impulsa al equipo a mantenerse activo y organizado en el cumplimiento de las tareas, velando porque cada actividad se realice correctamente, contribuyendo así a un trabajo colaborativo y eficiente.', img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1775790976/Group_69_1_izilnp.png'
    },
    {
      //Integrante 3
      img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1775784080/photoo_xfcuhk.png', title: 'Brayan Salazar Sánchez', imgAvatar: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855850/image_30_2_aaebco.png', text: 'Es desarrollador full stack, con un enfoque principal en el front-end. Siempre está dispuesto a ayudar y aportar al equipo en cualquier área que lo necesite, demostrando su compromiso y colaboración. Aunque es una persona reservada, en los momentos cruciales comparte ideas valiosas y soluciones efectivas que marcan la diferencia en el progreso del proyecto.'
    },
    {
      //Integrante 4
      title: 'Daniela Buitrago Fajardo', imgAvatar: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855861/image_17_1_xa7pav.png', text: 'Ella integra el equipo del proyecto LingCode, participando como miembro del grupo durante el desarrollo del aplicativo. Forma parte del proceso de trabajo colaborativo del equipo, acompañando las distintas fases del proyecto y contribuyendo al avance general de las actividades planteadas para su ejecución.', img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765856311/Group_71_k9jstz.png'
    },
    {
      //Integrante 5
      img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1772731407/santiago_p4sjrh.jpg', title: 'Santiago Hurtado Marulanda', imgAvatar: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765855894/image_9_2_myqaws.png', text: 'Es desarrollador de backend y se destaca por su capacidad de análisis crítico. A través de sus observaciones y aportes, ha contribuido a identificar y mejorar aspectos del proyecto que inicialmente no se habían tenido en cuenta. Además, su enfoque analítico ha permitido detectar oportunidades de optimización y reforzar la toma de decisiones técnicas, contribuyendo así a fortalecer la calidad, estabilidad y solidez del desarrollo del sistema.'
    }
  ]
}