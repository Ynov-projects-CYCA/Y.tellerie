import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IPaymentProvider,
  IPaymentProvider as IPaymentProviderSymbol,
} from '../ports/payment-provider.port';

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(
    @Inject(IPaymentProviderSymbol)
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(payload: Buffer, signature: string) {
    const event = await this.paymentProvider.retrieveEvent(signature, payload);

    this.logger.log(`Stripe event received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      this.logger.log(
        `Checkout session completed: ${session.id} for ${session.amount_total} ${session.currency}`,
      );
      // Here you would load the Payment aggregate and mark it as succeeded.
    }

    return { received: true };
  }
}
