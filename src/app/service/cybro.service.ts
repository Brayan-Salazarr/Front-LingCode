import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CybroMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  audioUrl?: string;
  feedback?: CybroFeedback;
}

export interface CybroFeedback {
  isCorrect: boolean;
  correction?: string;
  explanation?: string;
  pronunciationTip?: string;
  score: number;
}

export interface CybroRequest {
  message: string;
  audioData?: string;
  lessonId?: string;
  lessonContext?: LessonContext;
}

export interface LessonContext {
  lessonId?: string;
  lessonTitle?: string;
  moduleName?: string;
  lessonObjective?: string;
  currentExercise?: string;
}

export interface CybroResponse {
  messageId: string;
  text: string;
  audioUrl?: string;
  feedback?: CybroFeedback;
  isTyping?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CybroService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/cybro';

  private messagesSubject = new BehaviorSubject<CybroMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private isListeningSubject = new BehaviorSubject<boolean>(false);
  isListening$ = this.isListeningSubject.asObservable();

  private isSpeakingSubject = new BehaviorSubject<boolean>(false);
  isSpeaking$ = this.isSpeakingSubject.asObservable();

  private isTypingSubject = new BehaviorSubject<boolean>(false);
  isTyping$ = this.isTypingSubject.asObservable();

  private recognition: any;
  private synthesis = window.speechSynthesis;

  constructor() {
    this.initSpeechRecognition();
    this.loadWelcomeMessageWithoutSpeak();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-ES';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcribed:', transcript);
      };

      this.recognition.onend = () => {
        this.isListeningSubject.next(false);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListeningSubject.next(false);
      };
    }
  }

  private loadWelcomeMessage() {
    this.http.get<{message: string}>(`${this.baseUrl}/welcome`).subscribe({
      next: (response) => {
        console.log('Welcome response:', response);
        const welcomeMsg: CybroMessage = {
          id: 'welcome',
          content: response.message,
          role: 'assistant',
          timestamp: new Date()
        };
        this.messagesSubject.next([welcomeMsg]);
        this.speak(response.message);
      },
      error: (err) => {
        console.error('Error loading welcome:', err);
        const fallbackWelcome: CybroMessage = {
          id: 'welcome',
          content: 'Hola! Soy Cybro, tu asistente para aprender ingles tecnico. En que te puedo ayudar hoy?',
          role: 'assistant',
          timestamp: new Date()
        };
        this.messagesSubject.next([fallbackWelcome]);
      }
    });
  }

  private loadWelcomeMessageWithoutSpeak() {
    this.http.get<{message: string}>(`${this.baseUrl}/welcome`).subscribe({
      next: (response) => {
        console.log('Welcome response:', response);
        const welcomeMsg: CybroMessage = {
          id: 'welcome',
          content: response.message,
          role: 'assistant',
          timestamp: new Date()
        };
        this.messagesSubject.next([welcomeMsg]);
      },
      error: (err) => {
        console.error('Error loading welcome:', err);
        const fallbackWelcome: CybroMessage = {
          id: 'welcome',
          content: 'Hola! Soy Cybro, tu asistente para aprender ingles tecnico. En que te puedo ayudar hoy?',
          role: 'assistant',
          timestamp: new Date()
        };
        this.messagesSubject.next([fallbackWelcome]);
      }
    });
  }

  startListening(): void {
    if (this.recognition) {
      this.isListeningSubject.next(true);
      this.recognition.start();
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isListeningSubject.next(false);
    }
  }

  sendMessage(content: string, lessonContext?: LessonContext): Observable<CybroResponse> {
    console.log('Sending message:', content);
    
    const userMessage: CybroMessage = {
      id: `user-${Date.now()}`,
      content: content,
      role: 'user',
      timestamp: new Date()
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, userMessage]);

    const request: CybroRequest = {
      message: content,
      lessonContext: lessonContext
    };

    this.isTypingSubject.next(true);

    return new Observable(observer => {
      this.http.post<CybroResponse>(`${this.baseUrl}/chat`, request).subscribe({
        next: (response) => {
          console.log('AI Response:', response);
          this.isTypingSubject.next(false);
          
          const assistantMessage: CybroMessage = {
            id: response.messageId,
            content: response.text,
            role: 'assistant',
            timestamp: new Date(),
            feedback: response.feedback
          };

          const updatedMessages = this.messagesSubject.value;
          this.messagesSubject.next([...updatedMessages, assistantMessage]);

          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('Error sending message:', err);
          this.isTypingSubject.next(false);

          const isRateLimit = err.status === 429;
          const assistantMessage: CybroMessage = {
            id: `error-${Date.now()}`,
            content: isRateLimit
              ? 'Estoy recibiendo demasiadas solicitudes. Espera unos segundos e intenta de nuevo.'
              : 'Lo siento, tuve un problema al procesar tu mensaje. ¿Puedes intentarlo de nuevo?',
            role: 'assistant',
            timestamp: new Date()
          };

          const updatedMessages = this.messagesSubject.value;
          this.messagesSubject.next([...updatedMessages, assistantMessage]);

          observer.error(err);
        }
      });
    });
  }

  speak(text: string): void {
    if (this.synthesis) {
      this.stopSpeaking();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.pitch = 1;

      utterance.onstart = () => this.isSpeakingSubject.next(true);
      utterance.onend = () => this.isSpeakingSubject.next(false);
      utterance.onerror = () => this.isSpeakingSubject.next(false);

      this.synthesis.speak(utterance);
    }
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeakingSubject.next(false);
    }
  }

  speakEnglish(text: string): void {
    if (this.synthesis) {
      this.stopSpeaking();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1;

      utterance.onstart = () => this.isSpeakingSubject.next(true);
      utterance.onend = () => this.isSpeakingSubject.next(false);

      this.synthesis.speak(utterance);
    }
  }

  getMessages(): CybroMessage[] {
    return this.messagesSubject.value;
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  transcribeAudio(audioBlob: Blob): Observable<{transcription: string, confidence: number}> {
    return new Observable(observer => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64Audio = reader.result as string;
        const audioData = base64Audio.split(',')[1];

        this.http.post<{transcription: string, confidence: string}>(
          `${this.baseUrl}/transcribe`,
          { audio: audioData }
        ).subscribe({
          next: (response) => {
            observer.next({
              transcription: response.transcription,
              confidence: parseFloat(response.confidence)
            });
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        });
      };

      reader.readAsDataURL(audioBlob);
    });
  }

  checkHealth(): Observable<{status: string, agent: string}> {
    return this.http.get<{status: string, agent: string}>(`${this.baseUrl}/health`);
  }
}
