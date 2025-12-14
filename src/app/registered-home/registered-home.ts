import { Component } from '@angular/core';
import { Nav } from '../shared/components/nav/nav';
import { Header } from '../shared/components/header/header';
import { Footer } from '../shared/components/footer/footer';

@Component({
  selector: 'app-registered-home',
  imports: [Nav, Header, Footer],
  templateUrl: './registered-home.html',
  styleUrl: './registered-home.css',
})
export class RegisteredHome {

}
