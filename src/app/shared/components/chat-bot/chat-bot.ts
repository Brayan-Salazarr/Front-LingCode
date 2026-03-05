import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-chat-bot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.html',
  styleUrl: './chat-bot.css',
})
export class ChatBot {
//Controla si el char está abierto o cerrado
isOpen = false;

showChat = true;

 constructor(private router: Router) {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        const url = this.router.url;

        this.showChat = !(url.includes('login-registro'));

      });

  }

//Almacena el mensaje que el usuario está escribiendo
newMessage = '';
  // Historial de mensajes
  messages = [
    { text: '¡Hola! Soy tu asistente Cybro. ¿En qué puedo ayudarte?', type: 'bot' }
  ];

  //Abre o cierra el char al hacer clic
  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  //Envía el mensaje escrito por el usuario
  sendMessage() {
    //Verifica que el mensaje no esté vacío
    if (this.newMessage.trim()) {
      //Añadir mensaje del usuario
      this.messages.push({ text: this.newMessage, type: 'user' });
      
      //Guarda el mensaje en una variable temporal
      const userQuestion = this.newMessage;
      this.newMessage = ''; // Limpiar input

      //Simular respuesta del Bot
      setTimeout(() => {
        //Agrega la respuesta del bot al historial
        this.messages.push({ 
          text: `Recibí tu mensaje: "${userQuestion}". Pronto te daré una respuesta real.`, 
          type: 'bot' 
        });
      }, 1000);
    }
  }
}
