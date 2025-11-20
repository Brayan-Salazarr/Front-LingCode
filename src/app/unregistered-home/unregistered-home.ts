import { Component } from '@angular/core';
import { Nav } from '../shared/components/nav/nav';
import { Header } from '../shared/components/header/header';
import { Button } from '../shared/components/button/button';

@Component({
  selector: 'app-unregistered-home',
  imports: [Nav,Header,Button],
  templateUrl: './unregistered-home.html',
  styleUrl: './unregistered-home.css',
})
export class UnregisteredHome {

}
