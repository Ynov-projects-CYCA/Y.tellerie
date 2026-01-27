import { Money } from './money.vo';
import { PaymentStatus } from './payment-status.vo';

export interface PaymentProperties {
  id: string;
  description?: string;
  status: PaymentStatus;
  amount: Money;
  customerEmail?: string;
  checkoutSessionId?: string;
  createdAt: Date;
}

export class Payment {
  private readonly id: string;
  private description?: string;
  private status: PaymentStatus;
  private readonly amount: Money;
  private readonly customerEmail?: string;
  private checkoutSessionId?: string;
  private readonly createdAt: Date;

  private constructor(properties: PaymentProperties) {
    this.id = properties.id;
    this.description = properties.description;
    this.status = properties.status;
    this.amount = properties.amount;
    this.customerEmail = properties.customerEmail;
    this.checkoutSessionId = properties.checkoutSessionId;
    this.createdAt = properties.createdAt;
  }

  static create(props: Omit<PaymentProperties, 'createdAt'>): Payment {
    return new Payment({ ...props, createdAt: new Date() });
  }

  static reconstitute(props: PaymentProperties): Payment {
    return new Payment(props);
  }

  markSucceeded() {
    this.status = 'succeeded';
  }

  markCanceled() {
    this.status = 'canceled';
  }

  attachCheckoutSession(sessionId: string) {
    this.checkoutSessionId = sessionId;
  }

  getProperties(): PaymentProperties {
    return {
      id: this.id,
      description: this.description,
      status: this.status,
      amount: this.amount,
      customerEmail: this.customerEmail,
      checkoutSessionId: this.checkoutSessionId,
      createdAt: this.createdAt,
    };
  }
}
