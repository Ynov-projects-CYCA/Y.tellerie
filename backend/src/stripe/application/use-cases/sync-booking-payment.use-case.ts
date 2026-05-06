import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
export class SyncBookingPaymentUseCase {
  private readonly logger = new Logger(SyncBookingPaymentUseCase.name);

  constructor(
    @Inject(IPaymentProviderSymbol)
    private readonly paymentProvider: IPaymentProvider,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    private readonly sendMailUseCase: SendTransactionalEmailUseCase,
  ) {}

  async execute(bookingId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Reservation ${bookingId} introuvable`);
    }

    const payment = await this.paymentRepository.findLatestByBookingId(bookingId);
    if (!payment) {
      throw new NotFoundException(`Paiement introuvable pour la reservation ${bookingId}`);
    }

    const props = payment.getProperties();
    if (!props.checkoutSessionId) {
      throw new ConflictException(`Aucune session Stripe associee a la reservation ${bookingId}`);
    }

    const session = await this.paymentProvider.retrieveCheckoutSession(props.checkoutSessionId);
    if (session.payment_status !== 'paid') {
      return { booking, payment, synced: false };
    }

    const wasConfirmed = booking.getStatus().getValue() === 'CONFIRMED';
    payment.markSucceeded();
    if (typeof session.payment_intent === 'string') {
      payment.setPaymentIntentId(session.payment_intent);
    }
    booking.markConfirmed();

    await this.paymentRepository.save(payment);
    await this.bookingRepository.save(booking);

    if (!wasConfirmed) {
      await this.sendConfirmationEmail(booking);
    }

    return { booking, payment, synced: true };
  }

  private async sendConfirmationEmail(
    booking: NonNullable<Awaited<ReturnType<BookingRepositoryPort['findById']>>>,
  ): Promise<void> {
    try {
      const emailParams = {
        recipientName: `${booking.getGuestFirstName()} ${booking.getGuestLastName()}`,
        preheader: 'Votre réservation est confirmée !',
        title: 'Confirmation de réservation',
        intro: `Votre réservation n° ${booking.getId().substring(0, 8).toUpperCase()} est confirmée pour votre séjour du ${booking.getCheckInDate().toLocaleDateString('fr-FR')} au ${booking.getCheckOutDate().toLocaleDateString('fr-FR')}.`,
        body: "Nous avons hâte de vous accueillir dans notre établissement.",
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
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
