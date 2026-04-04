import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/authService';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  template: `<p style="color:white;text-align:center;margin-top:40vh">Iniciando sesión...</p>`,
})
export class OAuth2Callback implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const accessToken = params['accessToken'];
    const refreshToken = params['refreshToken'];

    if (!accessToken || !refreshToken) {
      this.router.navigate(['/login-registro']);
      return;
    }

    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    this.http.get<any>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (res) => {
        const u = res.data ?? res;
        const user = {
          userId: u.id,
          email: u.email,
          nickname: u.nickname,
          fullName: u.fullName,
          roles: u.roles,
          subscriptionPlan: u.subscriptionPlan,
          emailVerified: u.emailVerified,
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        (this.authService as any).currentUserSubject.next(user);
        this.router.navigate(['/registered-home']);
      },
      error: () => this.router.navigate(['/registered-home']),
    });
  }
}
