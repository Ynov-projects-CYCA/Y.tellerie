import { BookingStatus } from '../../../bookings/domain/booking-status.vo';
import { PaymentStatus } from '../../domain/payment-status.vo';

export class PaymentStatusResponseDto {
  bookingId!: string;
  bookingStatus!: BookingStatus;
  paymentId?: string;
  paymentStatus?: PaymentStatus;
  checkoutSessionId?: string;
  amount?: number;
  currency?: string;
  failureReason?: string;
}
