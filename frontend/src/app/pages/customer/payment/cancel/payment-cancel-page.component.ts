import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideXCircle, LucideRefreshCw, LucideHistory } from '@lucide/angular';
import { StripeApiService } from '@core';
import { ButtonComponent, CardComponent } from '@shared';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    LucideXCircle,
    LucideRefreshCw,
    LucideHistory
  ],
  templateUrl: './payment-cancel-page.component.html',
  styleUrl: './payment-cancel-page.component.scss'
})
export class PaymentCancelPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly stripeApi = inject(StripeApiService);
  
  protected readonly bookingId = signal<string | null>(null);
  protected readonly isRetrying = signal(false);

  ngOnInit(): void {
    this.bookingId.set(this.route.snapshot.queryParamMap.get('booking_id'));
  }

  protected retryPayment(): void {
    const id = this.bookingId();
    if (!id) return;

    this.isRetrying.set(true);
    this.stripeApi.createCheckoutSession({ bookingId: id }).subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (err) => {
        console.error('Failed to retry payment', err);
        this.isRetrying.set(false);
      }
    });
  }
}
