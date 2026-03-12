//Importamos lo necesario para que el componente funcione
import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';
import { NgForOf, NgIf } from '@angular/common';

//Interfaz que define cómo es cada pregunta de soporte.
//Tiene un título, una repuesta y un estado (cerrada o abierta )
interface SupportItem {
  title: string;
  answer: string;
  open: boolean;
}

//Interfaz que define cómo se organiza cada grupo de preguntas.
//cada grupo tiene un título principal y una lista de preguntas.
interface Group {
  mainTitle: string;
  support: SupportItem[];
  activeIndex: number | null;
}

@Component({
  selector: 'app-help-support',
  //Importamos los componentes y directivas que usamos en el HTML.
  imports: [Nav, Footer, NgForOf, NgIf],
  templateUrl: './help-support.html',
  styleUrl: './help-support.css',
})

//Componente principal de ayuda y soporte.
export class HelpSupport {
  //Guarda cual pregunta esta abierta actualmente.
  activeItem: SupportItem | null = null;

  //Se organiza todas las preguntas en grupos.
  GroupBox: Group[] = [
    {
      mainTitle: 'Cuenta',
      activeIndex: null,
      support: [
        //Lista de preguntas relacionadas con la cuenta.
        { title: '¿Qué es la racha?', answer: 'La racha (en tu inicio verás a Cybro con un ícono de llama 🔥) te muestra cuántos días seguidos has practicado en LingCode.\n Es como un pequeño recordatorio de lo constante que eres con tu aprendizaje.\n\n <b>Recuerda:</b> Si quieres mantener tu racha, intenta establecer un momento fijo del día para tus lecciones. Incluso unos minutos diarios ayudan a no perder el ritmo. Para activar las notificaciones puedes ir a la sección de editar perfil y dar click en el simbolo del engranaje⚙️ y seleccionar el botón correspondiente.', open: false },
        { title: '¿Cómo editar mi perfil?', answer: 'Para editar tu perfil en LingCode, ve a tu inicio y haz clic en el botón “Editar perfil” debajo de tu foto de perfil. Podrás cambiar tu foto de perfil o avatar, nombre, apodo, correo electrónico, contraseña y tus preferencias de notificaciones.', open: false },
        { title: '¿Cómo cerrar sesión?', answer: 'Para cerrar sesión en LingCode, ve a la esquina superior derecha de la pantalla, allí encontraras tu avatar o foto de perfil, al pie podrás seleccionar la opción "Cerrar sesión".', open: false }
      ]
    },
    {
      mainTitle: 'Uso de módulos',
      activeIndex: null,
      support: [
        //Preguntas sobre cómo usar los módulos.
        { title: '¿Cómo seleccionar un módulo?', answer: 'Para seleccionar un módulo en LingCode, abre el aplicativo en tu navegador y haz clic en la opción "Módulos" del menú principal. Allí verás todos los módulos disponibles.', open: false },
        { title: '¿Cómo iniciar una práctica?', answer: 'Para iniciar una práctica en LingCode, primero abre la sección Módulos en tu navegador y selecciona el módulo disponible.\nLuego haz clic en el botón "Practicar" dentro del módulo y comienza tus lecciones.', open: false },
        { title: '¿Cómo funciona el progreso por módulo?', answer: 'En LingCode, tu progreso se muestra de dos formas: \n\n <b>1.	Progreso general:</b> refleja todo tu avance sumando todos los módulos que has completado. Lo encontrarás en la página de inicio, para que veas tu aprendizaje de manera global.\n <b>2.	Progreso específico:</b> indica cómo vas en cada módulo individual y se encuentra al pie de cada módulo dentro de la sección de Módulos.', open: false }
      ]
    },
    {
      mainTitle: 'Suscripciones',
      activeIndex: null,
      support: [
        //Preguntas relacionadas con los planes y pagos.
        { title: '¿Qué incluye la suscripción básica?', answer: 'La suscripción básica en LingCode incluye:\n\n•<b>	Energía ilimitada:</b> Practica sin preocuparte por límites diarios.\n•	<b>Interacción sin anuncios:</b> Disfruta de tu aprendizaje sin interrupciones.\n<b>•	Acceso a todos los módulos:</b> Puedes interactuar y practicar con cualquier módulo disponible.\n\n<b>Recuerda:</b> La suscripción básica es ideal si quieres aprender de manera flexible y sin pausas, explorando todos los contenidos que el aplicativo ofrece.', open: false },
        { title: '¿Qué beneficios tiene la suscripción premium?', answer: 'La suscripción premium en LingCode incluye todo lo de la suscripción básica:\n\n•<b>	Energía ilimitada</b> para practicar sin límites diarios.\n•	<b>Interacción sin anuncios</b> para aprender sin interrupciones.\n•	<b>Acceso</b> a todos los módulos disponibles.\n\nAdemás, con la suscripción premium podrás <b>interactuar</b> con el chat de voz con <b>IA</b>, lo que te permite practicar tu pronunciación y comunicación de manera más dinámica.\n\nAprovecha el chat de voz para mejorar tu fluidez y reforzar lo que aprendes en cada módulo.', open: false },
        { title: '¿Cómo suscribirme?', answer: 'Para suscribirte en LingCode, abre la página principal en tu navegador y desplázate hacia la parte inferior. Allí encontrarás dos opciones con un botón de "Suscribirse".\nHaz clic en el plan que prefieras y serás dirigido a los métodos de pago para completar tu suscripción.\n\nRevisa tu plan antes de confirmar y asegúrate de elegir el que mejor se adapte a tus metas de aprendizaje', open: false },
        { title: '¿Cómo cancelar o cambiar mi plan?', answer: 'Para cancelar o cambiar tu plan en LingCode, ve a tu pagina de inicio y selecciona editar perfil, allí encontraras una opción que dice cancelar mi plan.\n\nAntes de cancelar, revisa los beneficios de tu plan actual y considera si quieres mantener tu progreso y ventajas de la suscripción premium.', open: false }
      ]
    },
    {
      mainTitle: 'Contacto',
      activeIndex: null,
      support: [
        //Contacto para que el usuario se comunique con el equipo de LingCode.
        { title: '¿Cómo puedo contactar al equipo de soporte?', answer: '¡Estamos aquí para ayudarte! Si tienes una duda general, revisa nuestras preguntas frecuentes. Pero si tu caso es urgente (problemas con pagos o acceso a tu cuenta), escríbenos directamente a nuestro <b>lingcode2026@gmail.com</b>. ¡Te responderemos lo antes posible!', open: false }
      ]
    }
  ];

  //Genera un índice único combinando el grupo y la posición del ítem.
  globalIndex(groupIndex: number, itemIndex: number): number {
    return groupIndex * 100 + itemIndex; // 100 es arbitrario, suficiente para separar índices de items
  }

  // Función que abre/cierra un item.
  //Si está cerrada, la abre y cierra cualquier otra.
  toggleItem(item: SupportItem) {
    this.activeItem = this.activeItem === item ? null : item;
  }
}