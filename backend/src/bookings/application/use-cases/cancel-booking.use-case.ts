import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '@/bookings/application/ports/booking-repository.port';
import { Booking } from '@/bookings/domain/booking.entity';

@Injectable()
export class CancelBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
  ) {}

  async execute(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Réservation ${bookingId} introuvable`);
    }

    if (booking.getStatus().getValue() === 'CONFIRMED') {
      throw new ConflictException('Impossible d\'annuler une réservation déjà payée via ce canal');
    }

    if (booking.getStatus().getValue() === 'CANCELED') {
      return booking;
    }

    booking.markCanceled();
    await this.bookingRepository.save(booking);

    return booking;
  }
}
