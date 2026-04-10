import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnergyService } from '../../service/energy-service';

// Declara el namespace global de YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

@Component({
  selector: 'app-ad-reward-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-reward-modal.html',
  styleUrl: './ad-reward-modal.css'
})
export class AdRewardModal implements OnInit, OnDestroy {

  // Emite true cuando el usuario reclamó energía, false si cerró sin ver
  @Output() closed = new EventEmitter<void>();

  countdown = 10;
  canClaim = false;
  playerReady = false;
  energyClaimed = false;

  private player: any;
  private countdownInterval: any;

  // ⚠️ Reemplaza con el ID del video de YouTube que quieras mostrar como anuncio
  // Ejemplo: 'dQw4w9WgXcQ' | Busca un video de tu canal o uno educativo de programación
  private readonly VIDEO_ID = 'ScMzIvxBSi4';

  constructor(private energyService: EnergyService) {}

  ngOnInit() {
    this.loadYouTubeApi();
  }

  private loadYouTubeApi() {
    // Si la API ya está cargada, inicializa el player directamente
    if (window.YT && window.YT.Player) {
      this.initPlayer();
      return;
    }

    // Registra el callback antes de cargar el script
    window.onYouTubeIframeAPIReady = () => this.initPlayer();

    // Evita cargar el script dos veces
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }

  private initPlayer() {
    this.player = new window.YT.Player('yt-player', {
      height: '100%',
      width: '100%',
      videoId: this.VIDEO_ID,
      playerVars: {
        autoplay: 1,
        controls: 0,       // Sin controles de usuario
        disablekb: 1,      // Sin teclado
        modestbranding: 1,
        rel: 0,
        fs: 0,             // Sin pantalla completa
        iv_load_policy: 3  // Sin anotaciones
      },
      events: {
        onReady: () => {
          this.playerReady = true;
          this.startCountdown();
        }
      }
    });
  }

  private startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.countdown = 0;
        this.canClaim = true;
        // Pausa el video después de 10 segundos
        if (this.player?.pauseVideo) {
          this.player.pauseVideo();
        }
      }
    }, 1000);
  }

  claimEnergy() {
    if (!this.canClaim || this.energyClaimed) return;
    this.energyClaimed = true;
    this.energyService.addEnergyFromAd();
    this.closed.emit();
  }

  ngOnDestroy() {
    clearInterval(this.countdownInterval);
    if (this.player?.destroy) {
      this.player.destroy();
    }
  }
}
