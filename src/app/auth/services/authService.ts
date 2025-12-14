import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  private USERS_KEY = 'users';
  private TOKEN_KEY = 'token';

  constructor() {}

  // 🔐 REGISTRO
  register(userData: {
    name: string;
    nickName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): boolean {

    const users = this.getUsers();

    const userExists = users.some(
      u => u.email === userData.email || u.nickName === userData.nickName
    );

    if (userExists) {
      return false;
    }

    users.push(userData);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    return true;
  }

  // 🔓 LOGIN
  login(email: string, nickName: string, password: string): boolean {
    const users = this.getUsers();

    const user = users.find(
      u =>
        (u.email === email || u.nickName === nickName) &&
        u.password === password
    );

    if (!user) return false;

    localStorage.setItem(this.TOKEN_KEY, 'logged');
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private getUsers(): any[] {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  }
}