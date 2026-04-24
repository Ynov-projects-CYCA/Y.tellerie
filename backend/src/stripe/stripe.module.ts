import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from '@/bookings/bookings.module';
import { MailjetModule } from '@/mailjet/mailjet.module';
import {
  PAYMENT_REPOSITORY,
} from './application/ports/payment-repository.port';
import { CancelBookingPaymentUseCase } from './application/use-cases/cancel-booking-payment.use-case';
import { StripeController } from './infrastructure/stripe.controller';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { GetBookingPaymentStatusUseCase } from './application/use-cases/get-booking-payment-status.use-case';
import { ProcessRefundUseCase } from './application/use-cases/process-refund.use-case';
import { HandleWebhookUseCase } from './application/use-cases/handle-webhook.use-case';
import { IPaymentProvider as IPaymentProviderSymbol } from './application/ports/payment-provider.port';
import { TypeOrmPaymentRepositoryAdapter } from './infrastructure/adapters/typeorm-payment-repository.adapter';
import { StripePaymentProvider } from './infrastructure/adapters/stripe-payment.provider';
import { PaymentEntity } from './infrastructure/persistence/payment.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([PaymentEntity]), BookingsModule, MailjetModule],
  controllers: [StripeController],
  providers: [
    CreateCheckoutSessionUseCase,
    HandleWebhookUseCase,
    GetBookingPaymentStatusUseCase,
    CancelBookingPaymentUseCase,
    ProcessRefundUseCase,
    {
      provide: IPaymentProviderSymbol,
      useClass: StripePaymentProvider,
    },
    {
      provide: PAYMENT_REPOSITORY,
      useClass: TypeOrmPaymentRepositoryAdapter,
    },
  ],
  exports: [IPaymentProviderSymbol, PAYMENT_REPOSITORY],
})
export class StripeModule {}
