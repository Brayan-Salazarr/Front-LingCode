import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

export interface User {
  name: string;
  nickName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export const environment = {
  production: false,
  apiUrl: 'https://li-ms-security.onrender.com'
};

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  loginData = {
  identifier: '',
  password: ''
};

  private USER_KEY = 'currentUser';
  private TOKEN_KEY = 'token';

  private currentUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem(this.USER_KEY) || 'null')
  );

  currentUser$ = this.currentUserSubject.asObservable();

  private api = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) { }

// 🔐 LOGIN REAL CON BACKEND
login(identifier: string, password: string) {
  return this.http.post<AuthResponse>(
    `${this.api}/login`,
    {
      identifier,
      password
    }
  ).pipe(
    tap(res => {
      localStorage.setItem(this.TOKEN_KEY, res.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
      this.currentUserSubject.next(res.user);
    })
  );
}

   // 📝 REGISTER REAL
  register(user: User & { password: string }) {
    return this.http.post<AuthResponse>(
      `${this.api}/register`,
      user
    ).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }



  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

 getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}