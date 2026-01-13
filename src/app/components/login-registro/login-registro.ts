import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/authService';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-registro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login-registro.html',
  styleUrl: './login-registro.css',
})
export class LoginRegistro {
  showLogin: boolean = false;

  loginData = {
    identifier: '',
    password: ''
  };

  registerData = {
    fullName: '',
    nickName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  login() {
    const success = this.authService.login(
      this.loginData.identifier,
      this.loginData.password
    ).subscribe({
      next:(res)=>{
        this.router.navigate(['/registered-home']);
      },
      error: (err) => {
        console.error('Error login:', err);
        alert('Error en el login: ' + (err.error?.message || 'Credenciales incorrectas'));
      }
    });
  }

  /*
    if (success) {
      this.router.navigate(['/registered-home']);
    } else {
      alert('Credenciales incorrectas');
    }
  }

*/
  register() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const payload = {
      full_name: this.registerData.fullName.trim(),
      nickname: this.registerData.nickName.trim(),
      email: this.registerData.email.trim(),
      password: this.registerData.password
    };

    const success = this.authService.register(payload as any).subscribe({
    next: () => {
      alert('Registro exitoso. Por favor inicia sesión.');
      this.router.navigate(['/login-registro'], { queryParams: { view: 'login' } });
    },
    error: err => {
      console.error('Error registro:', err);
      alert('Error en el registro: ' + (err.error?.message || 'Error desconocido'));
    }
  });
};
/*
    if (success) {
      alert('Registro exitoso');
      this.showLogin = true;
    } else {
      alert('El usuario ya existe');
    }
  }
*/

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