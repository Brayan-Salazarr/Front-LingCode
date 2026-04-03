import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-password',
  imports: [RouterModule, Nav, Footer, FormsModule],
  templateUrl: './new-password.html',
  styleUrl: './new-password.css',
})
export class NewPassword implements OnInit {

  newPassword = '';
  confirmPassword = '';
  errorMatch = false;
  errorStrength = false;
  private token = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    if (!this.token) {
      Swal.fire({ icon: 'error', title: 'Link inválido', text: 'El enlace de recuperación no es válido.' });
      this.router.navigate(['/login-registro'], { queryParams: { view: 'login' } });
    }
  }

  validateStrength(password: string): boolean {
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  }

  onPasswordChange(): void {
    this.errorStrength = this.newPassword.length > 0 && !this.validateStrength(this.newPassword);
    this.errorMatch = this.confirmPassword.length > 0 && this.newPassword !== this.confirmPassword;
  }

  onConfirmChange(): void {
    this.errorMatch = this.confirmPassword.length > 0 && this.newPassword !== this.confirmPassword;
  }

  resetPassword(): void {
    this.errorStrength = !this.validateStrength(this.newPassword);
    this.errorMatch = this.newPassword !== this.confirmPassword;

    if (this.errorStrength || this.errorMatch) return;

    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña actualizada!',
          text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
          confirmButtonText: 'Ir al login'
        }).then(() => this.router.navigate(['/login-registro'], { queryParams: { view: 'login' } }));
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'El enlace expiró o no es válido. Solicita uno nuevo.' });
      }
    });
  }
}
