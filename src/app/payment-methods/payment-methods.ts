import { Component } from '@angular/core';
import { Nav } from '../shared/components/nav/nav';
import { Footer } from '../shared/components/footer/footer';

@Component({
  selector: 'app-payment-methods',
  imports: [Nav, Footer],
  templateUrl: './payment-methods.html',
  styleUrl: './payment-methods.css',
})
export class PaymentMethods {
// Controla si la sección de PSE está expandida
  isPseExpanded: boolean = false;

  togglePse() {
    this.isPseExpanded = !this.isPseExpanded;
  }
}
