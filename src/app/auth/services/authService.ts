import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

export interface User {
  userId: string;
  fullName: string;
  nickname: string;
  email: string;
  avatar?: string;
  roles?: string[];
  subscriptionPlan?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

export const environment = {
  production: false,
  apiUrl: 'https://lingcode-api-gateway-1.onrender.com/api/v1',
};

// Respuesta del backend en POST /auth/login y /auth/refresh
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    nickname: string;
    fullName: string;
    avatarUrl?: string;
    provider: string;
    roles: string[];
    subscriptionPlan: string;
    emailVerified: boolean;
    createdAt: string;
    lastLogin: string;
  };
}

// Respuesta del backend en POST /auth/register
interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    nickname: string;
    fullName: string;
    avatarUrl?: string;
    roles: string[];
    subscriptionPlan: string;
    emailVerified: boolean;
    createdAt: string;
  };
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private USER_KEY = 'currentUser';
  private TOKEN_KEY = 'token';
  private REFRESH_TOKEN_KEY = 'refreshToken';

  private currentUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem('currentUser') || 'null')
  );

  currentUser$ = this.currentUserSubject.asObservable();

  private api = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) { }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  login(identifier: string, password: string) {
    return this.http.post<AuthResponse>(`${this.api}/login`, { identifier, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);

        const user: User = {
          userId: res.user.id,
          fullName: res.user.fullName,
          nickname: res.user.nickname,
          email: res.user.email,
          avatar: res.user.avatarUrl,
          roles: res.user.roles,
          subscriptionPlan: res.user.subscriptionPlan,
          emailVerified: res.user.emailVerified,
          createdAt: res.user.createdAt,
        };

        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  // Register NO devuelve tokens — el usuario debe verificar email antes de hacer login
  register(data: {
    email: string;
    nickname: string;
    password: string;
    confirmPassword: string;
    fullName: string;
  }) {
    return this.http.post<RegisterResponse>(`${this.api}/register`, data);
  }

  refreshToken() {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return this.http.post<AuthResponse>(`${this.api}/refresh`, { refreshToken }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
      })
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (refreshToken) {
      this.http.post(`${this.api}/logout`, { refreshToken }).subscribe({ error: () => {} });
    }
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const decoded = this.decodeToken(token);
    return decoded?.exp * 1000 > Date.now();
  }

  // Eliminar cuenta — endpoint pendiente en el backend
  deleteAccountAuth() {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  updateCurrentUser(data: Partial<User>): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) return false;
    const updatedUser: User = { ...currentUser, ...data };
    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
    return true;
  }
}
