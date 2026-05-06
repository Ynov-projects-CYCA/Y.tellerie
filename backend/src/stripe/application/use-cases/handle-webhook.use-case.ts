import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '@/bookings/application/ports/booking-repository.port';
import {
  IPaymentProvider,
  IPaymentProvider as IPaymentProviderSymbol,
} from '@/stripe/application/ports/payment-provider.port';
import {
  PAYMENT_REPOSITORY,
  PaymentRepositoryPort,
} from '@/stripe/application/ports/payment-repository.port';
import { SendTransactionalEmailUseCase } from '@/mailjet/application/use-cases/send-transactional-email.use-case';
import { buildActionEmailHtml, buildActionEmailText } from '@/mailjet/application/templates/action-email.template';
import { buildFrontendUrl } from '@/config/frontend-url';

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(
    @Inject(IPaymentProviderSymbol)
    private readonly paymentProvider: IPaymentProvider,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    private readonly sendMailUseCase: SendTransactionalEmailUseCase,
  ) {}

  async execute(payload: Buffer, signature: string) {
    const event = await this.paymentProvider.retrieveEvent(signature, payload);

    this.logger.log(`Stripe event received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      await this.markSucceeded(event.data.object);
    }

    if (event.type === 'checkout.session.async_payment_failed') {
      await this.markFailed(event.data.object);
    }

    if (event.type === 'checkout.session.expired') {
      await this.markCanceled(event.data.object);
    }

    return { received: true };
  }

  private async markSucceeded(session: Stripe.Checkout.Session): Promise<void> {
    const payment = await this.resolvePayment(session);
    if (!payment) {
      this.logger.warn(`No payment found for checkout session ${session.id}`);
      return;
    }

    const booking = await this.bookingRepository.findById(
      payment.getProperties().bookingId,
    );
    if (!booking) {
      this.logger.warn(
        `No booking found for payment ${payment.getProperties().id}`,
      );
      return;
    }

    const wasConfirmed = booking.getStatus().getValue() === 'CONFIRMED';
    payment.markSucceeded();
    if (typeof session.payment_intent === 'string') {
      payment.setPaymentIntentId(session.payment_intent);
    }
    booking.markConfirmed();

    await this.paymentRepository.save(payment);
    await this.bookingRepository.save(booking);

    if (wasConfirmed) {
      this.logger.log(
        `Booking ${booking.getId()} already confirmed; confirmation email skipped`,
      );
      return;
    }

    try {
      const emailParams = {
        recipientName: `${booking.getGuestFirstName()} ${booking.getGuestLastName()}`,
        preheader: 'Votre réservation est confirmée !',
        title: 'Confirmation de paiement',
        intro: `Nous avons bien reçu votre paiement pour votre séjour du ${booking.getCheckInDate().toLocaleDateString('fr-FR')} au ${booking.getCheckOutDate().toLocaleDateString('fr-FR')}.`,
        body: `Votre réservation n° ${booking.getId().substring(0, 8).toUpperCase()} est désormais confirmée. Nous avons hâte de vous accueillir dans notre établissement.`,
        ctaLabel: 'Voir ma réservation',
        actionUrl: buildFrontendUrl('/client/historique'),
        footerNote: 'Merci de votre confiance.',
      };

      await this.sendMailUseCase.execute({
        to: { email: booking.getGuestEmail(), name: emailParams.recipientName },
        subject: 'Confirmation de votre réservation - Ytellerie',
        html: buildActionEmailHtml(emailParams),
        text: buildActionEmailText(emailParams),
      });
    } catch (error: any) {
      this.logger.error(`Failed to send confirmation email: ${error.message}`);
    }

    this.logger.log(
      `Checkout session completed: ${session.id} for booking ${booking.getId()}`,
    );
  }

  private async markFailed(session: Stripe.Checkout.Session): Promise<void> {
    const payment = await this.resolvePayment(session);
    if (!payment) {
      this.logger.warn(`No payment found for failed checkout session ${session.id}`);
      return;
    }

    const booking = await this.bookingRepository.findById(
      payment.getProperties().bookingId,
    );
    if (!booking) {
      this.logger.warn(
        `No booking found for payment ${payment.getProperties().id}`,
      );
      return;
    }

    payment.markFailed(
      session.payment_status === 'unpaid'
        ? 'Stripe reported the checkout session as unpaid'
        : undefined,
    );
    booking.markPaymentFailed();

    await this.paymentRepository.save(payment);
    await this.bookingRepository.save(booking);
  }

  private async markCanceled(session: Stripe.Checkout.Session): Promise<void> {
    const payment = await this.resolvePayment(session);
    if (!payment) {
      this.logger.warn(`No payment found for expired checkout session ${session.id}`);
      return;
    }

    const booking = await this.bookingRepository.findById(
      payment.getProperties().bookingId,
    );
    if (!booking) {
      this.logger.warn(
        `No booking found for payment ${payment.getProperties().id}`,
      );
      return;
    }

    payment.markCanceled();
    booking.markCanceled();

    await this.paymentRepository.save(payment);
    await this.bookingRepository.save(booking);
  }

  private async resolvePayment(
    session: Stripe.Checkout.Session,
  ) {
    const paymentId = session.metadata?.paymentId;

    if (paymentId) {
      const payment = await this.paymentRepository.findById(paymentId);
      if (payment) {
        return payment;
      }
    }

    return this.paymentRepository.findByCheckoutSessionId(session.id);
  }
}
