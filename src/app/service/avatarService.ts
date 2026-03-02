import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  
  private avatarSource = new BehaviorSubject<string | null>(localStorage.getItem('avatar'));
  avatar$ = this.avatarSource.asObservable();

  setAvatar(url:string){
    localStorage.setItem('avatar',url)
    this.avatarSource.next(url);
  }
}
