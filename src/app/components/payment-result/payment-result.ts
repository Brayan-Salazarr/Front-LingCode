import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-payment-result',
  imports: [CommonModule, Nav, Footer],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.css',
})
export class PaymentResult implements OnInit {
  // Wompi envía el id de la transacción como query param
  transactionId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.transactionId = this.route.snapshot.queryParamMap.get('id') || '';
  }

  goHome() {
    this.router.navigate(['/registered-home']);
  }
}
