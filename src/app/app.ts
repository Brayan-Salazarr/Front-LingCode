import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';import { ChatBot } from './shared/components/chat-bot/chat-bot';
;


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ChatBot],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('LingCodeF');
}
