import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '@/bookings/application/ports/booking-repository.port';
import { Payment } from '@/stripe/domain/payment.entity';
import { Money } from '@/stripe/domain/money.vo';
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

@Injectable()
export class CreateCheckoutSessionUseCase {
  private readonly logger = new Logger(CreateCheckoutSessionUseCase.name);

  constructor(
    @Inject(IPaymentProviderSymbol)
    private readonly paymentProvider: IPaymentProvider,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    private readonly sendMailUseCase: SendTransactionalEmailUseCase,
  ) {}

  async execute(command: {
    bookingId: string;
    description?: string;
    sendPaymentEmail?: boolean;
  }): Promise<{ paymentId: string; bookingId: string; sessionId: string; url: string }> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new NotFoundException(
        `Reservation introuvable pour l'identifiant ${command.bookingId}`,
      );
    }

    const bookingStatus = booking.getStatus().getValue();
    if (bookingStatus === 'CONFIRMED') {
      throw new ConflictException(
        `La reservation ${command.bookingId} est deja payee`,
      );
    }
    if (bookingStatus === 'CANCELED') {
      throw new ConflictException(
        `La reservation ${command.bookingId} est annulee`,
      );
    }

    const payment = Payment.create({
      id: uuidv4(),
      bookingId: booking.getId(),
      amount: Money.create(Math.round(booking.getTotalPrice() * 100), booking.getCurrency()),
      status: 'pending',
      description:
        command.description ?? `Paiement de la reservation ${booking.getId()}`,
      customerEmail: booking.getGuestEmail(),
    });

    await this.paymentRepository.save(payment);
    const session = await this.paymentProvider.createCheckoutSession(payment);
    payment.attachCheckoutSession(session.sessionId);
    await this.paymentRepository.save(payment);

    if (command.sendPaymentEmail !== false) {
      await this.sendPaymentLinkEmail({
        checkoutUrl: session.url,
        description: payment.getProperties().description,
        booking,
      });
    }

    return {
      paymentId: payment.getProperties().id,
      bookingId: booking.getId(),
      ...session,
    };
  }

  private async sendPaymentLinkEmail(params: {
    checkoutUrl: string;
    description?: string;
    booking: NonNullable<Awaited<ReturnType<BookingRepositoryPort['findById']>>>;
  }): Promise<void> {
    if (!params.checkoutUrl) {
      this.logger.warn(
        `No checkout URL returned for booking ${params.booking.getId()}; payment email skipped`,
      );
      return;
    }

    const recipientName = [
      params.booking.getGuestFirstName(),
      params.booking.getGuestLastName(),
    ].filter(Boolean).join(' ');
    const checkIn = params.booking.getCheckInDate().toLocaleDateString('fr-FR');
    const checkOut = params.booking.getCheckOutDate().toLocaleDateString('fr-FR');
    const emailParams = {
      recipientName,
      preheader: 'Votre reservation est en attente de paiement',
      title: 'Finaliser votre paiement',
      intro: 'Votre reservation a bien ete creee.',
      body: [
        params.description ?? `Reservation ${params.booking.getId()}`,
        `Sejour du ${checkIn} au ${checkOut}.`,
        `Montant a regler : ${params.booking.getTotalPrice()} ${params.booking.getCurrency()}.`,
      ].join(' '),
      ctaLabel: 'Payer ma reservation',
      actionUrl: params.checkoutUrl,
      footerNote: 'Ce lien vous redirige vers notre page de paiement securisee Stripe.',
    };

    try {
      await this.sendMailUseCase.execute({
        to: {
          email: params.booking.getGuestEmail(),
          name: recipientName,
        },
        subject: 'Finalisez le paiement de votre reservation Ytellerie',
        html: buildActionEmailHtml(emailParams),
        text: buildActionEmailText(emailParams),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send payment link email for booking ${params.booking.getId()}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
