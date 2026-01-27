import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeController } from './infrastructure/stripe.controller';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { HandleWebhookUseCase } from './application/use-cases/handle-webhook.use-case';
import { IPaymentProvider as IPaymentProviderSymbol } from './application/ports/payment-provider.port';
import { StripePaymentProvider } from './infrastructure/adapters/stripe-payment.provider';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [
    CreateCheckoutSessionUseCase,
    HandleWebhookUseCase,
    {
      provide: IPaymentProviderSymbol,
      useClass: StripePaymentProvider,
    },
  ],
  exports: [IPaymentProviderSymbol],
})
export class StripeModule {}
