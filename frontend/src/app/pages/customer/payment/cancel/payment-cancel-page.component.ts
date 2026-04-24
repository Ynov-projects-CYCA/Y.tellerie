import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideXCircle, LucideRefreshCw } from '@lucide/angular';
import { CardComponent } from '../../../../shared/components/card.component';
import { ButtonComponent } from '../../../../shared/components/button.component';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    LucideXCircle,
    LucideRefreshCw
  ],
  templateUrl: './payment-cancel-page.component.html',
  styleUrl: './payment-cancel-page.component.scss'
})
export class PaymentCancelPageComponent {}
