import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, throwError } from 'rxjs';

//Modelo de usuario usado en todo el aplicativo
export interface User {
  userId: string; //Identificador único del usuario
  fullName: string; //Nombre completo del usuario
  nickName: string; //Apodo o alias del usuario
  email: string; //Correo eléctronico
  avatar?: string; //Imagen de perfil (opcional)
  createdAt?: string; //Fecha de creación de la cuenta (opcional)
}

export const environment = {
  production: false,
  apiUrl: 'https://li-ms-security.onrender.com',
  useLocalAuth: true
};

//Respuesta esperada del backend al autenticarse
interface AuthResponse {
  token: string; //Token JWT para autenticación
  //Dependiendo del endpoint el backend puede devolver: usuario completo o algunos campos 
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

  /*loginData = {
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
  localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);

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
  localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);

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

  refreshToken() {
  const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

  return this.http.post<AuthResponse>(
    `${this.api}/refresh`,
    { refreshToken }
  ).pipe(
    tap(res => {
      localStorage.setItem(this.TOKEN_KEY, res.token);

      if (res.refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
      }
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
  }*/

  //Claves que se usan para guardar información en el localStorage
  private USERS_KEY = 'users';
  private USER_KEY = 'currentUser';
  private TOKEN_KEY = 'token';

  //Subject que mantiene al usuario actual en memoria.
  //Se inicializa con el usuario guardado en localStorage
  private currentUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem(this.USER_KEY) || 'null')
  );

  //Observable para que otros componentes escuchen cambios del usuario.
  currentUser$ = this.currentUserSubject.asObservable();

  // 🔐 LOGIN LOCAL
  //Busca el usuario en localStorage por email o nickname y valida la contraseña
  login(identifier: string, password: string): Observable<boolean> {
    const users: any[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');

    const user = users.find(
      u =>
        (u.email === identifier || u.nickName === identifier) &&
        u.password === password
    );

    //Si no encuentra usuario válido lanza error
    if (!user) {
      return throwError(() => new Error('Credenciales incorrectas'));
    }

    //Simula un token de autenticación
    localStorage.setItem(this.TOKEN_KEY, 'fake-jwt-token');

    //Guarda al usuario sin la contraseña
    const { password: _, ...safeUser } = user;
    localStorage.setItem(this.USER_KEY, JSON.stringify(safeUser));
    //Actualiza el usuario en memoria
    this.currentUserSubject.next(safeUser);

    return of(true);
  }

  //REGISTRO LOCAL
  //Registra un nuevo usuario en localStorage
  register(user: User & { password: string }): Observable<boolean> {
    const users: any[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');

    //Verifica que no exista email o nickname repetido
    const exists = users.some(u => u.email === user.email || u.nickName === user.nickName);
    if (exists) return throwError(() => new Error('El usuario ya existe'));

    //Se ignora cualquier userId recibido
    const { userId: ignoredUserId, ...userWithoutId } = user;

    //Se crea el nuevo usuario con id y fecha
    const newUser = {
      ...userWithoutId,
      userId: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    //Guarda el nuevo usuario en la lista
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    //Actualizamos el usuario logueado
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem(this.USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(this.TOKEN_KEY, 'fake-jwt-token');
    this.currentUserSubject.next(safeUser);

    return of(true);
  }

  //Actualiza el usuario actual manualmente
  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  //Cierra la sesión del usuario
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  //Verifica si hay un usuario autenticado
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  //Devuelve el usuario actual en memoria
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  //Actualiza los datos del usuario actual
  updateCurrentUser(data: Partial<User>) {

    const currentUser = this.currentUserSubject.value;

    if (!currentUser) return;

    //Combina los datos actuales con los nuevos
    const updatedUser: User = {
      ...currentUser,
      ...data
    };

    //Guarda cambios en localStorage y en memoria
    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));

    this.currentUserSubject.next(updatedUser);
  }

  //Elimina la cuenta del usuario actual
  deleteAccountAuth(){
    const currentUser = this.currentUserSubject.value;
    if(!currentUser) return;

    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]')

    //Elimina el usuario de la lista
    const updatedUsers = users.filter(
      (u: any) => u.email !== currentUser.email
    );

    localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));

    //Cierra sesión después de eliminar la cuenta
    this.logout();
  }
}