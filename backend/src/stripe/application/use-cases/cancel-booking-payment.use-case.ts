import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '../../../bookings/application/ports/booking-repository.port';
import {
  PAYMENT_REPOSITORY,
  PaymentRepositoryPort,
} from '../ports/payment-repository.port';

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
      throw new NotFoundException(`Booking with id ${bookingId} not found`);
    }

    const payment = await this.paymentRepository.findLatestByBookingId(bookingId);
    if (!payment) {
      throw new NotFoundException(
        `No payment found for booking with id ${bookingId}`,
      );
    }

    const { status } = payment.getProperties();
    if (status === 'succeeded') {
      throw new ConflictException(
        `Payment for booking with id ${bookingId} is already completed`,
      );
    }

    payment.markCanceled();
    booking.markCanceled();

    const savedPayment = await this.paymentRepository.save(payment);
    const savedBooking = await this.bookingRepository.save(booking);

    return { booking: savedBooking, payment: savedPayment };
  }
}
