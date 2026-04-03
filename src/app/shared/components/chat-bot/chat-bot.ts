import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/services/authService';

interface Message {
  text: string;
  type: 'user' | 'bot';
}

@Component({
  selector: 'app-chat-bot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.html',
  styleUrl: './chat-bot.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatBot implements OnInit, OnDestroy {
  @ViewChild('chatBody') chatBody!: ElementRef;
  
  isOpen = false;
  showChat = true;
  newMessage = '';
  messages: Message[] = [];
  isRecording = false;
  isSpeaking = false;
  isListening = false;
  interimTranscript = '';

  private recognition: any;
  private mediaRecorder: any;
  private audioChunks: Blob[] = [];
  private subscriptions: Subscription[] = [];
  private baseUrl = 'http://localhost:8088/api/cybro';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initSpeechRecognition();
    
    this.subscriptions.push(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.showChat = !this.router.url.includes('login-registro');
          this.cdr.markForCheck();
        })
    );

    const user = this.authService.getCurrentUser();
    const greeting = user
      ? `¡Hola, ${user.nickname}! Soy Cybro 🤖, tu asistente de inglés técnico. ¿En qué te puedo ayudar hoy? Puedes usar el micrófono para hablarme!`
      : '¡Hola! Soy Cybro 🤖, tu asistente de inglés técnico para developers. ¿En qué te puedo ayudar?';
    this.messages.push({ text: greeting, type: 'bot' });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stopSpeaking();
    if (this.recognition) {
      this.recognition.abort();
    }
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-ES';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.isRecording = true;
        this.cdr.markForCheck();
      };

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        if (event.results[event.results.length - 1].isFinal) {
          this.interimTranscript = '';
          if (transcript.trim()) {
            this.newMessage = transcript;
            this.sendMessage();
          }
        } else {
          this.interimTranscript = transcript;
          this.cdr.markForCheck();
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.isRecording = false;
        this.interimTranscript = '';
        this.cdr.markForCheck();
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        this.isRecording = false;
        this.cdr.markForCheck();
      };
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.cdr.markForCheck();
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userText = this.newMessage;
    this.messages.push({ text: userText, type: 'user' });
    this.newMessage = '';
    this.interimTranscript = '';
    this.scrollToBottom();

    const user = this.authService.getCurrentUser();
    const userContext = user ? { nickname: user.nickname, fullName: user.fullName } : null;

    this.http.post<any>(`${this.baseUrl}/chat`, { message: userText, userContext }).subscribe({
      next: (response) => {
        this.messages.push({ text: response.text, type: 'bot' });
        this.cdr.markForCheck();
        this.scrollToBottom();
        if (response.navigateTo) {
          setTimeout(() => this.router.navigate([response.navigateTo]), 500);
        }
      },
      error: () => {
        this.messages.push({ text: 'Lo siento, no pude procesar tu mensaje.', type: 'bot' });
        this.cdr.markForCheck();
      }
    });
  }

  toggleVoiceRecording() {
    if (!this.recognition) {
      this.messages.push({ text: 'Tu navegador no soporta reconocimiento de voz.', type: 'bot' });
      this.cdr.markForCheck();
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('Recognition start error:', e);
      }
    }
  }

  private checkNavigation(text: string) {
    const lower = text.toLowerCase();
    
    if (lower.includes('ir a') || lower.includes('ve a') || lower.includes('navega') || lower.includes('abre') || lower.includes('llevame') || lower.includes('muéstrame') || lower.includes('mostrame')) {
      setTimeout(() => {
        if (lower.includes('inicio') || lower.includes('home') || lower.includes('principal')) {
          this.router.navigate(['/registered-home']);
        }
        else if (lower.includes('misión') || lower.includes('mision') || lower.includes('visión')) {
          this.router.navigate(['/mission']);
        }
        else if (lower.includes('módulo') || lower.includes('modulo') || lower.includes('clases') || lower.includes('leccione')) {
          this.router.navigate(['/module-view']);
        }
        else if (lower.includes('perfil') || lower.includes('cuenta')) {
          this.router.navigate(['/edit-profile']);
        }
        else if (lower.includes('método') || lower.includes('metodo') || lower.includes('enseñanza')) {
          this.router.navigate(['/teaching-method']);
        }
        else if (lower.includes('término') || lower.includes('termino') || lower.includes('condicione') || lower.includes('política') || lower.includes('normas')) {
          this.router.navigate(['/norms-politics']);
        }
        else if (lower.includes('nosotros') || lower.includes('about') || lower.includes('acerca')) {
          this.router.navigate(['/about-us']);
        }
        else if (lower.includes('ayuda') || lower.includes('soporte') || lower.includes('help')) {
          this.router.navigate(['/help-support']);
        }
        else if (lower.includes('pago') || lower.includes('precio') || lower.includes('tarifa')) {
          this.router.navigate(['/payment-methods']);
        }
        else if (lower.includes('registro') || lower.includes('registrar') || lower.includes('crear cuenta')) {
          this.router.navigate(['/login-registro']);
        }
        this.cdr.markForCheck();
      }, 500);
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatBody) {
        const element = this.chatBody.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 50);
  }

  speakMessage(text: string) {
    if (this.isSpeaking) {
      this.stopSpeaking();
    } else {
      const spokenText = text.replace(/Cybro/gi, 'Saibro');
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.onstart = () => {
        this.isSpeaking = true;
        this.cdr.markForCheck();
      };
      utterance.onend = () => {
        this.isSpeaking = false;
        this.cdr.markForCheck();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        this.cdr.markForCheck();
      };
      speechSynthesis.speak(utterance);
    }
  }

  stopSpeaking() {
    speechSynthesis.cancel();
    this.isSpeaking = false;
    this.cdr.markForCheck();
  }
}
