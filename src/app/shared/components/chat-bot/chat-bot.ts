import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/services/authService';
import { ProgressService } from '../../../service/progress-service';
import { AdminService, AdminStats } from '../../../service/admin.service';
import { environment } from '../../../../environments/environment';

interface UserStats {
  totalXp: number;
  completedLessons: number;
  progressPercent: number;
  currentStreak: number;
  longestStreak: number;
  daysSince: number | null;
}

interface Message {
  text: string;
  type: 'user' | 'bot' | 'chart' | 'admin-chart';
  chartData?: UserStats;
  adminData?: AdminStats & { estimatedRevenue: number };
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
  isAdmin = false;

  private recognition: any;
  private subscriptions: Subscription[] = [];
  private baseUrl = environment.cybroUrl;
  private userStats: UserStats | null = null;
  private adminStats: (AdminStats & { estimatedRevenue: number }) | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private progressService: ProgressService,
    private adminService: AdminService
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

    if (user) {
      this.isAdmin = user.roles?.includes('ADMIN') ?? false;

      // Suscribirse al progreso del usuario
      this.subscriptions.push(
        this.progressService.progress$.subscribe(progress => {
          if (progress) {
            const daysSince = user.createdAt
              ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000)
              : null;
            this.userStats = {
              totalXp: progress.totalXp,
              completedLessons: progress.completedLessons.length,
              progressPercent: progress.progressPercent,
              currentStreak: progress.currentStreak,
              longestStreak: progress.longestStreak,
              daysSince
            };
          }
        })
      );
      this.progressService.getProgress(user.userId).subscribe({ error: () => {} });

      // Cargar stats admin si corresponde
      if (this.isAdmin) {
        this.adminService.getStats().subscribe({
          next: stats => {
            this.adminStats = {
              ...stats,
              estimatedRevenue: this.adminService.estimatedMonthlyRevenue(stats.usersByPlan)
            };
          },
          error: () => {}
        });
      }
    }

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
    const sessionId = user?.userId ?? 'anonymous';

    this.http.post<any>(`${this.baseUrl}/chat`, {
      message: userText,
      sessionId,
      userContext,
      userStats: this.userStats,
      adminStats: this.isAdmin ? this.adminStats : null
    }).subscribe({
      next: (response) => {
        this.messages.push({ text: response.text, type: 'bot' });

        if (response.showChart && this.userStats) {
          this.messages.push({ text: '', type: 'chart', chartData: this.userStats });
        }
        if (response.showAdminChart && this.adminStats) {
          this.messages.push({ text: '', type: 'admin-chart', adminData: this.adminStats });
        }

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

  getStrokeDasharray(percent: number): string {
    return `${percent} 100`;
  }

  getPlanEntries(usersByPlan: { [key: string]: number }): { plan: string; count: number }[] {
    return Object.entries(usersByPlan).map(([plan, count]) => ({ plan, count }));
  }

  downloadAdminPDF(adminData: AdminStats & { estimatedRevenue: number }) {
    const date = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const planRows = Object.entries(adminData.usersByPlan)
      .map(([plan, count]) => `<tr><td>${plan}</td><td>${count}</td></tr>`)
      .join('');
    const providerRows = Object.entries(adminData.usersByProvider)
      .map(([p, count]) => `<tr><td>${p}</td><td>${count}</td></tr>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte Admin — LingCode</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; }
          h1 { color: #7c3aed; margin-bottom: 4px; }
          .date { color: #666; font-size: 13px; margin-bottom: 30px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
          .card h3 { margin: 0 0 4px; font-size: 13px; color: #6b7280; }
          .card .value { font-size: 28px; font-weight: 700; color: #1a1a2e; }
          .card .sub { font-size: 12px; color: #9ca3af; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 12px; }
          td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
          .revenue { color: #059669; font-size: 32px; font-weight: 700; }
          .section { margin-bottom: 24px; }
          .section h2 { font-size: 15px; margin-bottom: 12px; border-bottom: 2px solid #7c3aed; padding-bottom: 6px; }
        </style>
      </head>
      <body>
        <h1>📊 Reporte Administrativo — LingCode</h1>
        <div class="date">Generado el ${date}</div>

        <div class="grid">
          <div class="card">
            <h3>Total de usuarios</h3>
            <div class="value">${adminData.totalUsers}</div>
            <div class="sub">+${adminData.newUsersThisMonth} este mes</div>
          </div>
          <div class="card">
            <h3>Ingresos estimados (MRR)</h3>
            <div class="value revenue">$${adminData.estimatedRevenue.toFixed(2)} USD</div>
            <div class="sub">basado en planes activos</div>
          </div>
          <div class="card">
            <h3>Usuarios activos (últimas 24h)</h3>
            <div class="value">${adminData.activeUsersLast24h}</div>
            <div class="sub">${adminData.activeUsersLast7d} en los últimos 7 días</div>
          </div>
          <div class="card">
            <h3>Verificación de email</h3>
            <div class="value">${adminData.verifiedUsers}</div>
            <div class="sub">${adminData.unverifiedUsers} sin verificar</div>
          </div>
        </div>

        <div class="section">
          <h2>Distribución por plan</h2>
          <table>
            <thead><tr><th>Plan</th><th>Usuarios</th></tr></thead>
            <tbody>${planRows}</tbody>
          </table>
        </div>

        <div class="section">
          <h2>Distribución por proveedor</h2>
          <table>
            <thead><tr><th>Proveedor</th><th>Usuarios</th></tr></thead>
            <tbody>${providerRows}</tbody>
          </table>
        </div>

        <div class="section">
          <h2>Nuevos registros</h2>
          <table>
            <thead><tr><th>Período</th><th>Usuarios</th></tr></thead>
            <tbody>
              <tr><td>Hoy</td><td>${adminData.newUsersToday}</td></tr>
              <tr><td>Esta semana</td><td>${adminData.newUsersThisWeek}</td></tr>
              <tr><td>Este mes</td><td>${adminData.newUsersThisMonth}</td></tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  }
}
