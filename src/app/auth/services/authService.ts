import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

export interface User {
  fullName: string;
  nickName: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

export const environment = {
  production: false,
  apiUrl: 'https://li-ms-security.onrender.com'
};

interface AuthResponse {
  token: string;
  user?: User;
  nickname?: string;
  fullName?: string;
  nickName?: string;
  email?: string;
  createdAt?: string;
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

// Método para decodificar el JWT
private decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    return null;
  }
}

// Método para obtener un usuario por ID
getUserById(userId: number) {
  return this.http.get<User>(`${environment.apiUrl}/users/${userId}`);
}

// 🔐 LOGIN REAL CON BACKEND
login(identifier: string, password: string) {
  return this.http.post<AuthResponse>(
    `${this.api}/login`,
    {
      loginIdentifier: identifier,
      password
    }
  ).pipe(
    tap(res => {
      localStorage.setItem(this.TOKEN_KEY, res.token);

      // Decodificar el JWT para obtener la información del usuario
      const decodedToken = this.decodeToken(res.token);

      // Obtener datos del usuario del token o de la respuesta
      const userId = decodedToken?.user_id;
      const user: User = {
        fullName: decodedToken?.full_name || res.fullName || '',
        nickName: res.nickName || res.nickname || decodedToken?.sub || '',
        email: res.email || '',
        createdAt: res.createdAt
      };

      // Si tenemos el user_id, obtener los datos completos del backend
      if (userId) {
        this.getUserById(userId).subscribe({
          next: (fullUserData: any) => {
            const completeUser: User = {
              ...user,
              ...fullUserData
            };
            localStorage.setItem(this.USER_KEY, JSON.stringify(completeUser));
            this.currentUserSubject.next(completeUser);
          },
          error: () => {
            // Si falla, usar los datos del token
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        });
      } else {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      }
    })
  );
}

   //  REGISTER REAL
  register(user: User & { password: string }) {
    return this.http.post<AuthResponse>(
      `${this.api}/register`,
      user
    ).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);

        // El backend puede devolver la data del usuario de diferentes formas
        const userData: User =  {
          fullName: user.fullName,
          nickName: user.nickName,
          email: user.email,
          createdAt: new Date().toISOString()
        };

        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        this.currentUserSubject.next(userData);
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