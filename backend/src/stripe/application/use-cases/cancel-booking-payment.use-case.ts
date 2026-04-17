import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '@/bookings/application/ports/booking-repository.port';
import {
  PAYMENT_REPOSITORY,
  PaymentRepositoryPort,
} from '@/stripe/application/ports/payment-repository.port';

@Injectable()
export class CancelBookingPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
  ) {}

  async execute(bookingId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(
        `Reservation introuvable pour l'identifiant ${bookingId}`,
      );
    }

    const payment = await this.paymentRepository.findLatestByBookingId(bookingId);
    if (!payment) {
      throw new NotFoundException(
        `Aucun paiement trouve pour la reservation ${bookingId}`,
      );
    }

    const { status } = payment.getProperties();
    if (status === 'succeeded') {
      throw new ConflictException(
        `Le paiement de la reservation ${bookingId} est deja finalise`,
      );
    }

    payment.markCanceled();
    booking.markCanceled();

    const savedPayment = await this.paymentRepository.save(payment);
    const savedBooking = await this.bookingRepository.save(booking);

    return { booking: savedBooking, payment: savedPayment };
  }
}
