import { Component } from '@angular/core';
import { Nav } from '../shared/components/nav/nav';
import { Footer } from '../shared/components/footer/footer';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  imports: [RouterModule,Nav,Footer],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {

}
