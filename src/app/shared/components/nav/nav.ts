import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [RouterModule,NgClass],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  @Input() colorBackground = '';
}
