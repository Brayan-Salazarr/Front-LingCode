import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Nav } from '../shared/components/nav/nav';

@Component({
  selector: 'app-new-password',
  imports: [RouterModule,Nav],
  templateUrl: './new-password.html',
  styleUrl: './new-password.css',
})
export class NewPassword {

  constructor(private router:Router){}

  goLogin() {
    this.router.navigate(
      ['/login-registro'],{queryParams:{view: 'login'}}
    );
  }
}