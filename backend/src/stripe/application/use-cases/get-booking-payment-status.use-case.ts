import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '../../../bookings/application/ports/booking-repository.port';
import {
  PAYMENT_REPOSITORY,
  PaymentRepositoryPort,
} from '../ports/payment-repository.port';

@Injectable()
export class GetBookingPaymentStatusUseCase {
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

    return { booking, payment };
  }
}
