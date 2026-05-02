import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@core/http';

export interface CheckoutSessionRequest {
  bookingId: string;
  description?: string;
}

export interface CheckoutSessionResponse {
  paymentId: string;
  bookingId: string;
  sessionId: string;
  url: string;
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
}
