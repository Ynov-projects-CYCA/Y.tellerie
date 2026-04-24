import Stripe from 'stripe';
import { Payment } from '@/stripe/domain/payment.entity';

export const IPaymentProvider = Symbol('IPaymentProvider');

export interface IPaymentProvider {
  createCheckoutSession(payment: Payment): Promise<{
    sessionId: string;
    url: string;
  }>;

  refund(paymentId: string): Promise<void>;

  retrieveEvent(signature: string, payload: Buffer): Promise<Stripe.Event>;
}
