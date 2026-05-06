import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@core/http';

export interface CheckoutSessionRequest {
  bookingId: string;
  description?: string;
  sendPaymentEmail?: boolean;
}

export interface CheckoutSessionResponse {
  paymentId: string;
  bookingId: string;
  sessionId: string;
  url: string;
}

export interface PaymentStatusResponse {
  bookingId: string;
  bookingStatus: string;
  paymentId?: string;
  paymentStatus?: string;
  checkoutSessionId?: string;
  amount?: number;
  currency?: string;
  failureReason?: string;
}

@Injectable({ providedIn: 'root' })
export class StripeApiService {
  private readonly apiClient = inject(ApiClient);

  createCheckoutSession(payload: CheckoutSessionRequest): Observable<CheckoutSessionResponse> {
    return this.apiClient.post<CheckoutSessionResponse, CheckoutSessionRequest>(
      '/stripe/checkout',
      payload,
    );
  }

  syncBookingPayment(bookingId: string): Observable<PaymentStatusResponse> {
    return this.apiClient.post<PaymentStatusResponse, Record<string, never>>(
      `/stripe/bookings/${bookingId}/sync-payment`,
      {},
    );
  }
}
