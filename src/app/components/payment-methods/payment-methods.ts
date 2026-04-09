import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Nav } from '../../shared/components/nav/nav';
import { Footer } from '../../shared/components/footer/footer';
import { SubscriptionService } from '../../service/subscription.service';
import { AuthService } from '../../auth/services/authService';

@Component({
  selector: 'app-payment-methods',
  imports: [CommonModule, Nav, Footer],
  templateUrl: './payment-methods.html',
  styleUrl: './payment-methods.css',
})
export class PaymentMethods implements OnInit {
  planCode: string = '';
  loading: boolean = false;
  error: string = '';
  alreadySubscribed: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Verificar autenticación
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login-registro']);
      return;
    }

    // Leer planCode de query params
    this.planCode = this.route.snapshot.queryParamMap.get('plan') || 'premium';
  }

  confirmPayment() {
    const user = this.authService.getCurrentUser();
    if (!user || this.loading) return;

    this.loading = true;
    this.error = '';

    this.subscriptionService.subscribe(this.planCode, user.email, user.fullName).subscribe({
      next: (res) => {
        if (res.data?.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
        } else {
          this.error = 'No se pudo generar el link de pago. Intenta de nuevo.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.alreadySubscribed = true;
        } else {
          this.error = 'Ocurrió un error al procesar el pago. Intenta de nuevo.';
        }
      },
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
