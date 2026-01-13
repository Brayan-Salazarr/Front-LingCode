import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-mission',
  imports: [Nav,Header,Footer],
  templateUrl: './mission.html',
  styleUrl: './mission.css',
})
export class Mission {

}
