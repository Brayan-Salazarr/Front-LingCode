import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-new-password',
  imports: [RouterModule],
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