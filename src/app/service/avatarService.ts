import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AvatarService {

  private avatarSource = new BehaviorSubject<string | null>(
    localStorage.getItem('avatar')
  );

  avatar$ = this.avatarSource.asObservable();

  setAvatar(url: string | null) {

    if (url) {
      localStorage.setItem('avatar', url);
    } else {
      localStorage.removeItem('avatar');
    }

    this.avatarSource.next(url);
  }
}