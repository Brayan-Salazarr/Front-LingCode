import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-bot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.html',
  styleUrl: './chat-bot.css',
})
export class ChatBot {
isOpen = false;

newMessage = '';
  // Historial de mensajes
  messages = [
    { text: '¡Hola! Soy tu asistente Cybro. ¿En qué puedo ayudarte?', type: 'bot' }
  ];

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      // 1. Añadir mensaje del usuario
      this.messages.push({ text: this.newMessage, type: 'user' });
      
      const userQuestion = this.newMessage;
      this.newMessage = ''; // Limpiar input

      // 2. Simular respuesta del Bot
      setTimeout(() => {
        this.messages.push({ 
          text: `Recibí tu mensaje: "${userQuestion}". Pronto te daré una respuesta real.`, 
          type: 'bot' 
        });
      }, 1000);
    }
  }
}
