import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {ApiClient} from '../http/api-client.service';
import {AvailabilityResponse, Booking, BookingSummaryRequest, BookingSummaryResponse} from './models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingsApiService {
  private readonly apiClient = inject(ApiClient);

  searchAvailability(params: {
    checkInDate: string;
    checkOutDate: string;
    capacity?: number;
  }): Observable<AvailabilityResponse[]> {
    return this.apiClient.get<AvailabilityResponse[]>('/bookings/availability', {
      params,
    });
  }

  getSummary(payload: BookingSummaryRequest): Observable<BookingSummaryResponse> {
    return this.apiClient.post<BookingSummaryResponse, BookingSummaryRequest>(
      '/bookings/summary',
      payload,
    );
  }

  confirm(payload: BookingSummaryRequest): Observable<Booking> {
    return this.apiClient.post<Booking, BookingSummaryRequest>('/bookings', payload);
  }

  findOne(id: string): Observable<Booking> {
    return this.apiClient.get<Booking>(`/bookings/${id}`);
  }

  findAll(): Observable<Booking[]> {
    return this.apiClient.get<Booking[]>('/bookings');
  }
}
