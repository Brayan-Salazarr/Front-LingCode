import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {

  private enabled = true;

  private successAudio = new Audio('/sounds/success.mp3');
  private errorAudio = new Audio('/sounds/error.mp3');
  private notification = new Audio('/sounds/notification.mp3');

  constructor() {
    const saved = localStorage.getItem('soundEnabled');
    this.enabled = saved !== null ? saved === 'true' : true;
  }

  setEnabled(value: boolean) {
    this.enabled = value;
    localStorage.setItem('soundEnabled', String(value));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  playSuccess() {
    if (!this.enabled) return;
    this.successAudio.currentTime = 0;
    this.successAudio.play();
  }

  playError() {
    if (!this.enabled) return;
    this.errorAudio.currentTime = 0;
    this.errorAudio.play();
  }

  playComplete() {
    if (!this.enabled) return;
    this.notification.currentTime = 0;
    this.notification.play();
  }
}