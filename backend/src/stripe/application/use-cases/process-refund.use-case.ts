import { Inject, Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
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

@Injectable()
export class ProcessRefundUseCase {
  private readonly logger = new Logger(ProcessRefundUseCase.name);

  constructor(
    @Inject(IPaymentProviderSymbol)
    private readonly paymentProvider: IPaymentProvider,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    private readonly sendMailUseCase: SendTransactionalEmailUseCase,
  ) {}

  async execute(bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Réservation ${bookingId} introuvable`);
    }

    if (booking.getStatus().getValue() !== 'REFUND_REQUESTED' && booking.getStatus().getValue() !== 'CONFIRMED') {
        throw new BadRequestException('La réservation doit être en statut CONFIRMED ou REFUND_REQUESTED pour être remboursée');
    }

    const payment = await this.paymentRepository.findLatestByBookingId(bookingId);
    if (!payment) {
      throw new NotFoundException(`Aucun paiement trouvé pour la réservation ${bookingId}`);
    }

    const props = payment.getProperties();
    if (props.status !== 'succeeded') {
      throw new BadRequestException(`Le paiement est en statut ${props.status}, il ne peut pas être remboursé`);
    }

    if (!props.paymentIntentId) {
       throw new BadRequestException('L\'identifiant de paiement Stripe est manquant');
    }

    try {
      await this.paymentProvider.refund(props.paymentIntentId);
      
      payment.markRefunded();
      booking.markRefunded();

      await this.paymentRepository.save(payment);
      await this.bookingRepository.save(booking);

      try {
        const emailParams = {
          recipientName: `${booking.getGuestFirstName()} ${booking.getGuestLastName()}`,
          preheader: 'Votre remboursement a été effectué.',
          title: 'Remboursement confirmé',
          intro: `Nous vous confirmons que le remboursement de votre réservation n° ${booking.getId().substring(0, 8).toUpperCase()} a été traité avec succès.`,
          body: `Le montant sera crédité sur votre compte bancaire dans un délai de 5 à 10 jours ouvrés, selon les délais de votre banque.`,
          ctaLabel: 'Voir mes réservations',
          actionUrl: `${process.env['FRONTEND_URL'] || 'http://localhost:4200'}/client/historique`,
          footerNote: 'En espérant vous revoir bientôt chez Ytellerie.',
        };

        await this.sendMailUseCase.execute({
          to: { email: booking.getGuestEmail(), name: emailParams.recipientName },
          subject: 'Confirmation de votre remboursement - Ytellerie',
          html: buildActionEmailHtml(emailParams),
          text: buildActionEmailText(emailParams),
        });
      } catch (error) {
        this.logger.error(`Failed to send confirmation email: ${error.message}`);
      }

      this.logger.log(`Refund processed for booking ${bookingId}`);
    } catch (error: any) {
      this.logger.error(`Failed to process refund for booking ${bookingId}: ${error.message}`);
      throw new BadRequestException(`Erreur lors du remboursement : ${error.message}`);
    }
  }
}
