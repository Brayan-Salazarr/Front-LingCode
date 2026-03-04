import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  fullName: string;
  nickName: string;
  email: string;
  password: string;
  avatar: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private initialUser: User = {
   fullName: '',
    nickName: '',
    email: '',
    password: '',
    avatar: null
  };

  private userSubject = new BehaviorSubject<User>(this.getUserFromStorage());

  user$ = this.userSubject.asObservable();

  constructor() { };

  updateUser(user: User) {
    const {fullName, nickName, email, password, avatar} = user;
    const userToStore: User = {fullName, nickName, email, password, avatar}

    localStorage.setItem('user', JSON.stringify(userToStore));
    this.userSubject.next(userToStore);
  }

  private getUserFromStorage(): User {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : this.initialUser;
  }

  getCurrentUser(): User{
    return this.userSubject.value;
  }
}