import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

export interface User {
  name: string;
  nickName: string;
  email: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private USER_KEY = 'currentUser';

  private currentUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem(this.USER_KEY) || 'null')
  );

  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  register(user: User & { password: string }): boolean {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    return true;
  }

  login(email: string, nickName: string, password: string): boolean {
    const user = JSON.parse(localStorage.getItem(this.USER_KEY) || 'null');
    if (!user) return false;

    if (user.email === email || user.nickName === nickName) {
      this.currentUserSubject.next(user);
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}