import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-module-view',
  imports: [Nav, Header, Footer, CommonModule],
  templateUrl: './module-view.html',
  styleUrl: './module-view.css',
})
export class ModuleView {
modules = [
  { title: 'GitHub', progress: 75, img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763696348/Group_25_fnpomn.png', status: 'done' },
  { title: 'MySQL', progress: 0, img: 'https://res.cloudinary.com/ddvjgyi3f/image/upload/v1763695172/mysql-removebg-preview-removebg-preview_2_hc65ln.png', status: 'pending' }
];
}
