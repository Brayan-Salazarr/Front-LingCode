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
    const userToSave: User = {
      name: user.name,
      nickName: user.nickName,
      email: user.email,
      avatar: user.avatar ?? 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1765737833/image_46_kk56a6.png'
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(userToSave));
    this.currentUserSubject.next(userToSave);

    return true;
  }

  login(email: string, nickName: string, password: string): boolean {
    const storedUser = JSON.parse(localStorage.getItem(this.USER_KEY) || 'null');

    if (!storedUser) return false;

    if (
      storedUser.email === email ||
      storedUser.nickName === nickName
    ) {
      this.currentUserSubject.next(storedUser);
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

   isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}