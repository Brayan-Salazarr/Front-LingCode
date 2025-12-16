import { Component } from '@angular/core';
import { Nav } from '../shared/components/nav/nav';
import { Header } from '../shared/components/header/header';
import { Footer } from '../shared/components/footer/footer';

@Component({
  selector: 'app-teaching-method',
  imports: [Nav,Header,Footer],
  templateUrl: './teaching-method.html',
  styleUrl: './teaching-method.css',
})
export class TeachingMethod {

}
