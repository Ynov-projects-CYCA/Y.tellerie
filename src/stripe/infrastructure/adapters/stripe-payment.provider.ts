import Stripe from 'stripe';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../../domain/payment.entity';
import { IPaymentProvider } from '../../application/ports/payment-provider.port';

@Injectable()
export class StripePaymentProvider implements IPaymentProvider {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripePaymentProvider.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('stripe.secretKey');
    if (!apiKey) {
      throw new Error('Missing STRIPE_SECRET_KEY');
    }
    // Use Stripe's default API version (configured on your account) to avoid type literal mismatch
    this.stripe = new Stripe(apiKey);
  }

  async createCheckoutSession(payment: Payment): Promise<{
    sessionId: string;
    url: string;
  }> {
    const props = payment.getProperties();
    const currency =
      props.amount.getCurrency() ??
      this.configService.get<string>('stripe.currency') ??
      'usd';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      currency,
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: props.amount.getAmount(),
            product_data: {
              name: props.description ?? 'Payment',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: props.customerEmail,
      success_url: this.configService.get<string>('stripe.successUrl')!,
      cancel_url: this.configService.get<string>('stripe.cancelUrl')!,
      metadata: {
        paymentId: props.id,
      },
    });

    this.logger.log(
      `Created checkout session ${session.id} for payment ${props.id}`,
    );

    return { sessionId: session.id, url: session.url ?? '' };
  }

  retrieveEvent(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'stripe.webhookSecret',
    );
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
    return Promise.resolve(event);
  }
}
