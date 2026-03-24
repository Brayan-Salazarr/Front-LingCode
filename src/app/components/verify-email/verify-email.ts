import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../auth/services/authService';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; background:#000; color:#fff; font-family:Poppins,sans-serif; text-align:center; padding:20px;">
      @if (loading) {
        <p style="font-size:18px;">Verificando tu correo...</p>
      }
      @if (!loading && success) {
        <div style="max-width:400px;">
          <div style="width:80px; height:80px; border-radius:50%; border:3px solid #90ee90; display:flex; align-items:center; justify-content:center; margin:0 auto 24px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#90ee90" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style="font-size:24px; margin-bottom:12px;">¡Correo verificado!</h2>
          <p style="color:#aaa; margin-bottom:32px;">Tu cuenta ha sido activada. Ya puedes iniciar sesión.</p>
          <button (click)="goToLogin()" style="background:transparent; border:2px solid #fff; color:#fff; padding:10px 32px; border-radius:8px; font-size:16px; cursor:pointer;">
            Ir al login
          </button>
        </div>
      }
      @if (!loading && !success) {
        <div style="max-width:400px;">
          <div style="width:80px; height:80px; border-radius:50%; border:3px solid #ff6b6b; display:flex; align-items:center; justify-content:center; margin:0 auto 24px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <h2 style="font-size:24px; margin-bottom:12px;">Enlace inválido</h2>
          <p style="color:#aaa; margin-bottom:32px;">{{ errorMessage }}</p>
          <button (click)="goToLogin()" style="background:transparent; border:2px solid #fff; color:#fff; padding:10px 32px; border-radius:8px; font-size:16px; cursor:pointer;">
            Ir al login
          </button>
        </div>
      }
    </div>
  `,
})
export class VerifyEmail implements OnInit {
  loading = true;
  success = false;
  errorMessage = 'El enlace de verificación es inválido o ha expirado.';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.loading = false;
      return;
    }

    this.http.get(`${environment.apiUrl}/auth/verify-email?token=${token}`).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.success = false;
        this.errorMessage = err.error?.message || 'El enlace de verificación es inválido o ha expirado.';
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login-registro'], { queryParams: { view: 'login' } });
  }
}
