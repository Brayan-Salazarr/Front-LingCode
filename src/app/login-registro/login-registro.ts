import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-registro',
  imports: [CommonModule, RouterModule],
  templateUrl: './login-registro.html',
  styleUrl: './login-registro.css',
})
export class LoginRegistro {
  showLogin: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const view = params['view'];

      if (view === 'login') {
        this.showLogin = true;
      }

      if (view === 'register') {
        this.showLogin = false;
      }
    })
  }

  toggleAuth(): void {
    const overlay = document.getElementById("blackOverlay");
    if (!overlay) return;
    const goingToLogin = !this.showLogin;

    this.showLogin = !this.showLogin;
    
    if (goingToLogin) {

      overlay?.classList.add("slide-right");
      overlay?.classList.remove("slide-left", "exit-left", "exit-right");
    } else {

      overlay?.classList.add("slide-left");
      overlay?.classList.remove("slide-right", "exit-left", "exit-right");
    }

    setTimeout(() => {
      let exitClass: string;
      let slideClass: string;

      if (goingToLogin) {
        slideClass = "slide-right";
        exitClass = "exit-right";
      } else {
        slideClass = "slide-left";
        exitClass = "exit-left";
      }

      overlay!.classList.remove(slideClass);

      const listener = (event: Event) => {

        if ((event as TransitionEvent).propertyName === 'transform') {

          overlay!.classList.remove(exitClass);

          overlay!.classList.remove(slideClass);

          overlay!.removeEventListener('transitionend', listener);
        }
      };

      overlay!.addEventListener('transitionend', listener);
    }, 600);
  }

  isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isConfirmModal = false;
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeConfirmModal() {
    this.isConfirmModal = false;
  }

  isConfirmModal: boolean = false;

  openConfirmModal() {
    this.isModalOpen = false;
    this.isConfirmModal = true;
  }

  goNewPassword() {
    this.closeConfirmModal();
    this.router.navigate(['/new-password'])
  }
}