import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';

//COMPONENTE DE MÉTODOS DE PAGO
@Component({
  selector: 'app-payment-methods',
  imports: [Nav, Footer],
  templateUrl: './payment-methods.html',
  styleUrl: './payment-methods.css',
})
export class PaymentMethods {

//ESTADO DE LA SECCIÓN PSE
// Controla si la sección de PSE está expandida
  isPseExpanded: boolean = false;

  //MÉTODO PARA TOGGLE PSE
  //Cambia el estado de la sección PSE: si está cerrada, se abre y viceversa.
  togglePse() {
    this.isPseExpanded = !this.isPseExpanded;
  }
}