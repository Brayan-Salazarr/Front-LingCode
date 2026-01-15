import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';
import { Button } from '../../shared/components/button/button';
import { CarouselModules } from '../carousel-modules/carousel-modules';
import { Footer } from '../../shared/components/footer/footer';
import { CarouselAvatar } from '../../shared/components/carousel-avatar/carousel-avatar';
import { CommonModule } from '@angular/common';
import { Subscriptions } from '../../shared/components/subscriptions/subscriptions';

@Component({
  selector: 'app-unregistered-home',
  imports: [Nav,Header,Button,CarouselModules,Footer,CarouselAvatar,Subscriptions,CommonModule],
  templateUrl: './unregistered-home.html',
  styleUrl: './unregistered-home.css',
})
export class UnregisteredHome {

}
