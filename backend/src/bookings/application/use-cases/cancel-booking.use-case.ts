import { Inject, Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '@/bookings/application/ports/booking-repository.port';
import { Booking } from '@/bookings/domain/booking.entity';
import { SendTransactionalEmailUseCase } from '@/mailjet/application/use-cases/send-transactional-email.use-case';
import { buildActionEmailHtml, buildActionEmailText } from '@/mailjet/application/templates/action-email.template';
import { buildFrontendUrl } from '@/config/frontend-url';

@Injectable()
export class CancelBookingUseCase {
  private readonly logger = new Logger(CancelBookingUseCase.name);

  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    private readonly sendMailUseCase: SendTransactionalEmailUseCase,
  ) {}

  async execute(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Réservation ${bookingId} introuvable`);
    }

    if (booking.getStatus().getValue() === 'CONFIRMED') {
      booking.markRefundRequested();
      await this.bookingRepository.save(booking);

      try {
        const emailParams = {
          recipientName: `${booking.getGuestFirstName()} ${booking.getGuestLastName()}`,
          preheader: 'Votre demande de remboursement est prise en compte.',
          title: 'Demande de remboursement',
          intro: `Nous avons bien reçu votre demande d'annulation et de remboursement pour votre réservation n° ${booking.getId().substring(0, 8).toUpperCase()}.`,
          body: `Notre équipe administrative va traiter votre demande dans les plus brefs délais. Vous recevrez un e-mail de confirmation une fois le remboursement effectué.`,
          ctaLabel: 'Suivre ma demande',
          actionUrl: buildFrontendUrl('/client/historique'),
          footerNote: 'Merci de votre patience.',
        };

        await this.sendMailUseCase.execute({
          to: { email: booking.getGuestEmail(), name: emailParams.recipientName },
          subject: 'Votre demande de remboursement - Ytellerie',
          html: buildActionEmailHtml(emailParams),
          text: buildActionEmailText(emailParams),
        });
      } catch (error) {
        this.logger.error(`Failed to send confirmation email: ${error.message}`);
      }

      return booking;
    }

    if (booking.getStatus().getValue() === 'CANCELED') {
      return booking;
    }

    booking.markCanceled();
    await this.bookingRepository.save(booking);

    return booking;
  }
}
