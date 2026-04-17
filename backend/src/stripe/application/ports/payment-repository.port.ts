import { Payment } from '@/stripe/domain/payment.entity';

export interface PaymentRepositoryPort {
  save(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByCheckoutSessionId(sessionId: string): Promise<Payment | null>;
  findLatestByBookingId(bookingId: string): Promise<Payment | null>;
}

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');
