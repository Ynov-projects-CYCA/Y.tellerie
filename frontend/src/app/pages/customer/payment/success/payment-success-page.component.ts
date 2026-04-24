import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideCheckCircle, LucideArrowRight } from '@lucide/angular';
import { CardComponent } from '../../../../shared/components/card.component';
import { ButtonComponent } from '../../../../shared/components/button.component';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    LucideCheckCircle,
    LucideArrowRight
  ],
  templateUrl: './payment-success-page.component.html',
  styleUrl: './payment-success-page.component.scss'
})
export class PaymentSuccessPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  bookingId: string | null = null;

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.queryParamMap.get('booking_id');
  }
}
