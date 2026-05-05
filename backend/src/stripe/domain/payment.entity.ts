import { Money } from './money.vo';
import { PaymentStatus } from './payment-status.vo';

export interface PaymentProperties {
  id: string;
  bookingId: string;
  description?: string;
  status: PaymentStatus;
  amount: Money;
  customerEmail?: string;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Payment {
  private readonly id: string;
  private readonly bookingId: string;
  private description?: string;
  private status: PaymentStatus;
  private readonly amount: Money;
  private readonly customerEmail?: string;
  private checkoutSessionId?: string;
  private paymentIntentId?: string;
  private failureReason?: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(properties: PaymentProperties) {
    this.id = properties.id;
    this.bookingId = properties.bookingId;
    this.description = properties.description;
    this.status = properties.status;
    this.amount = properties.amount;
    this.customerEmail = properties.customerEmail;
    this.checkoutSessionId = properties.checkoutSessionId;
    this.paymentIntentId = properties.paymentIntentId;
    this.failureReason = properties.failureReason;
    this.createdAt = properties.createdAt;
    this.updatedAt = properties.updatedAt;
  }

  static create(props: Omit<PaymentProperties, 'createdAt' | 'updatedAt'>): Payment {
    const now = new Date();
    return new Payment({ ...props, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: PaymentProperties): Payment {
    return new Payment(props);
  }

  markSucceeded() {
    this.status = 'succeeded';
    this.failureReason = undefined;
    this.updatedAt = new Date();
  }

  markCanceled() {
    this.status = 'canceled';
    this.updatedAt = new Date();
  }

  markFailed(reason?: string) {
    this.status = 'failed';
    this.failureReason = reason;
    this.updatedAt = new Date();
  }

  markRefunded() {
    this.status = 'refunded';
    this.updatedAt = new Date();
  }

  attachCheckoutSession(sessionId: string) {
    this.checkoutSessionId = sessionId;
    this.updatedAt = new Date();
  }

  setPaymentIntentId(paymentIntentId: string) {
    this.paymentIntentId = paymentIntentId;
    this.updatedAt = new Date();
  }

  getProperties(): PaymentProperties {
    return {
      id: this.id,
      bookingId: this.bookingId,
      description: this.description,
      status: this.status,
      amount: this.amount,
      customerEmail: this.customerEmail,
      checkoutSessionId: this.checkoutSessionId,
      paymentIntentId: this.paymentIntentId,
      failureReason: this.failureReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
