import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../../domain/payment.entity';
import { Money } from '../../domain/money.vo';
import {
  IPaymentProvider,
  IPaymentProvider as IPaymentProviderSymbol,
} from '../ports/payment-provider.port';

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(IPaymentProviderSymbol)
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(command: {
    amount: number;
    currency: string;
    description?: string;
    customerEmail?: string;
  }): Promise<{ sessionId: string; url: string }> {
    const payment = Payment.create({
      id: uuidv4(),
      amount: Money.create(command.amount, command.currency),
      status: 'pending',
      description: command.description,
      customerEmail: command.customerEmail,
    });

    const session = await this.paymentProvider.createCheckoutSession(payment);
    payment.attachCheckoutSession(session.sessionId);

    return session;
  }
}
