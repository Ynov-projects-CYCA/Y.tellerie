import { Inject, Injectable } from '@nestjs/common';
import { BookingFactory } from '../../domain/booking.factory';
import { BookingSummaryDto } from '../dtos/booking-summary.dto';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '../ports/booking-repository.port';
import {
  BookingSummaryResult,
  GetBookingSummaryUseCase,
} from './get-booking-summary.use-case';
import { Booking } from '../../domain/booking.entity';

export interface ConfirmBookingResult extends BookingSummaryResult {
  booking: Booking;
}

@Injectable()
export class ConfirmBookingUseCase {
  constructor(
    private readonly bookingFactory: BookingFactory,
    private readonly getBookingSummaryUseCase: GetBookingSummaryUseCase,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
  ) {}

  async execute(dto: BookingSummaryDto): Promise<ConfirmBookingResult> {
    const summary = await this.getBookingSummaryUseCase.execute(dto);

    const booking = this.bookingFactory.createBooking(
      summary.room.getId(),
      summary.guestFirstName,
      summary.guestLastName,
      summary.guestEmail,
      summary.checkInDate,
      summary.checkOutDate,
      summary.nights,
      summary.totalPrice,
      summary.currency,
      summary.specialRequests,
    );

    const savedBooking = await this.bookingRepository.save(booking);

    return {
      ...summary,
      booking: savedBooking,
    };
  }
}
