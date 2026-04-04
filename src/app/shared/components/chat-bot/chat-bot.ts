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
  toolsOpen = false;

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

    const initialUser = this.authService.getCurrentUser();
    const greeting = initialUser
      ? `¡Hola, ${initialUser.nickname}! Soy Cybro 🤖, tu asistente de inglés técnico. ¿En qué te puedo ayudar hoy? Puedes usar el micrófono para hablarme!`
      : '¡Hola! Soy Cybro 🤖, tu asistente de inglés técnico para developers. ¿En qué te puedo ayudar?';
    this.messages.push({ text: greeting, type: 'bot' });

    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.isAdmin = user?.roles?.includes('ADMIN') ?? false;

        if (user) {
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
        } else {
          this.userStats = null;
          this.adminStats = null;
        }

        this.cdr.markForCheck();
      })
    );
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

  toggleTools() {
    this.toolsOpen = !this.toolsOpen;
    this.cdr.markForCheck();
  }

  sendQuickAction(message: string) {
    this.toolsOpen = false;
    this.newMessage = message;
    this.sendMessage();
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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Inter', Arial, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            padding: 0;
            min-height: 100vh;
          }

          .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-bottom: 2px solid #04C9FF;
            padding: 28px 48px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .header-left { display: flex; align-items: center; gap: 20px; }

          .header img { height: 48px; }

          .header-title { }
          .header-title h1 {
            font-size: 22px;
            font-weight: 900;
            background: linear-gradient(90deg, #04C9FF, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .header-title p { font-size: 12px; color: #94a3b8; margin-top: 2px; }

          .badge {
            background: rgba(4, 201, 255, 0.1);
            border: 1px solid #04C9FF;
            color: #04C9FF;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 20px;
            letter-spacing: 1px;
          }

          .content { padding: 36px 48px; }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 32px;
          }

          .card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            padding: 20px 24px;
          }

          .card.accent { border-color: rgba(4, 201, 255, 0.3); }

          .card h3 {
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }

          .card .value {
            font-size: 36px;
            font-weight: 900;
            color: #f1f5f9;
          }

          .card.accent .value {
            background: linear-gradient(90deg, #04C9FF, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .card .sub { font-size: 12px; color: #475569; margin-top: 4px; }

          .section { margin-bottom: 28px; }

          .section-title {
            font-size: 13px;
            font-weight: 700;
            color: #04C9FF;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(4, 201, 255, 0.2);
          }

          table { width: 100%; border-collapse: collapse; }

          thead tr { background: rgba(4, 201, 255, 0.06); }

          th {
            text-align: left;
            padding: 10px 16px;
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }

          td {
            padding: 10px 16px;
            font-size: 13px;
            color: #cbd5e1;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }

          tr:last-child td { border-bottom: none; }

          .footer {
            margin-top: 40px;
            padding: 20px 48px;
            border-top: 1px solid rgba(255,255,255,0.07);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .footer p { font-size: 11px; color: #334155; }

          @media print {
            body { background: #0f172a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <img src="https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763490191/Group_27_xduqke.png" alt="LingCode Logo" />
            <div class="header-title">
              <h1>Reporte Administrativo</h1>
              <p>Panel de control — LingCode Platform</p>
            </div>
          </div>
          <span class="badge">ADMIN</span>
        </div>

        <div class="content">
          <div class="grid">
            <div class="card">
              <h3>Total de usuarios</h3>
              <div class="value">${adminData.totalUsers}</div>
              <div class="sub">+${adminData.newUsersThisMonth} nuevos este mes</div>
            </div>
            <div class="card accent">
              <h3>Ingresos estimados (MRR)</h3>
              <div class="value">$${adminData.estimatedRevenue.toFixed(2)}</div>
              <div class="sub">USD · basado en planes activos</div>
            </div>
            <div class="card">
              <h3>Activos últimas 24h</h3>
              <div class="value">${adminData.activeUsersLast24h}</div>
              <div class="sub">${adminData.activeUsersLast7d} en los últimos 7 días</div>
            </div>
            <div class="card">
              <h3>Emails verificados</h3>
              <div class="value">${adminData.verifiedUsers}</div>
              <div class="sub">${adminData.unverifiedUsers} sin verificar</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Distribución por plan</div>
            <table>
              <thead><tr><th>Plan</th><th>Usuarios</th></tr></thead>
              <tbody>${planRows}</tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Distribución por proveedor</div>
            <table>
              <thead><tr><th>Proveedor</th><th>Usuarios</th></tr></thead>
              <tbody>${providerRows}</tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Nuevos registros</div>
            <table>
              <thead><tr><th>Período</th><th>Usuarios</th></tr></thead>
              <tbody>
                <tr><td>Hoy</td><td>${adminData.newUsersToday}</td></tr>
                <tr><td>Esta semana</td><td>${adminData.newUsersThisWeek}</td></tr>
                <tr><td>Este mes</td><td>${adminData.newUsersThisMonth}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="footer">
          <p>LingCode Platform · Reporte generado el ${date}</p>
          <p>Confidencial — Solo para uso interno</p>
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
