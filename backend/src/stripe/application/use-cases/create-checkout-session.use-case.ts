import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '../../../bookings/application/ports/booking-repository.port';
import { Payment } from '../../domain/payment.entity';
import { Money } from '../../domain/money.vo';
import {
  IPaymentProvider,
  IPaymentProvider as IPaymentProviderSymbol,
} from '../ports/payment-provider.port';
import {
  PAYMENT_REPOSITORY,
  PaymentRepositoryPort,
} from '../ports/payment-repository.port';

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(IPaymentProviderSymbol)
    private readonly paymentProvider: IPaymentProvider,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
  ) {}

  async execute(command: {
    bookingId: string;
    description?: string;
  }): Promise<{ paymentId: string; bookingId: string; sessionId: string; url: string }> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new NotFoundException(
        `Booking with id ${command.bookingId} not found`,
      );
    }

    const bookingStatus = booking.getStatus().getValue();
    if (bookingStatus === 'CONFIRMED') {
      throw new ConflictException(
        `Booking with id ${command.bookingId} is already paid`,
      );
    }
    if (bookingStatus === 'CANCELED') {
      throw new ConflictException(
        `Booking with id ${command.bookingId} is canceled`,
      );
    }

    const payment = Payment.create({
      id: uuidv4(),
      bookingId: booking.getId(),
      amount: Money.create(Math.round(booking.getTotalPrice() * 100), booking.getCurrency()),
      status: 'pending',
      description:
        command.description ?? `Reservation ${booking.getId()} payment`,
      customerEmail: booking.getGuestEmail(),
    });

    await this.paymentRepository.save(payment);
    const session = await this.paymentProvider.createCheckoutSession(payment);
    payment.attachCheckoutSession(session.sessionId);
    await this.paymentRepository.save(payment);

    return {
      paymentId: payment.getProperties().id,
      bookingId: booking.getId(),
      ...session,
    };
  }
}
