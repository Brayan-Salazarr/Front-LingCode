import { Component, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';import { ChatBot } from './shared/components/chat-bot/chat-bot';
import { filter } from 'rxjs';
import { AuthService } from './auth/services/authService';
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

   showHeader = true;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      let route = this.activatedRoute.firstChild;

      while (route?.firstChild) {
        route = route.firstChild;
      }

      const isModules = route?.snapshot.data?.['conditionalHeader'];
      const isLogged = this.authService.isAuthenticated();

      // 🔥 lógica clave
      this.showHeader = !(isModules && isLogged);
    });
  }
}
