import { Component } from '@angular/core';
import { Nav } from '../shared/components/nav/nav';
import { Footer } from '../shared/components/footer/footer';
import { Header } from '../shared/components/header/header';

@Component({
  selector: 'app-about-us',
  imports: [Nav, Header,Footer],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs {

}
