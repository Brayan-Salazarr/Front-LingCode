import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {

  private successAudio = new Audio('/sounds/success.mp3');
  private errorAudio = new Audio('/sounds/error.mp3');
  private notification = new Audio('/sounds/notification.mp3');

  playSuccess() {
    this.successAudio.currentTime = 0;
    this.successAudio.play();
  }

  playError() {
    this.errorAudio.currentTime = 0;
    this.errorAudio.play();
  }

  playComplete() {
    this.notification.currentTime = 0;
    this.notification.play();
  }
}
