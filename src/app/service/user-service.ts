import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  userId: string;
  fullName: string;
  nickName: string;
  email: string;
  password: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private initialUser: User = {
    userId: '',
    fullName: '',
    nickName: '',
    email: '',
    password: '',
    avatar: undefined
  };

  private userSubject = new BehaviorSubject<User | null>(
  JSON.parse(localStorage.getItem('currentUser') || 'null')
);

  user$ = this.userSubject.asObservable();

    constructor() {
    const storedUser = localStorage.getItem('currentUser');

    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  updateUser(user: Partial<User>) {
    const currentUser = this.getCurrentUser() ?? this .initialUser;

    const updatedUser : User = {
      ...currentUser, //Mantiene userId y datos actuales
      ...user //Reemplaza solo lo que el usuario cambio
    }

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    this.userSubject.next(updatedUser);
  }

  /*private getUserFromStorage(): User {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : this.initialUser;
  }*/

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
}