import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingFactory } from '@/bookings/domain/booking.factory';
import { BookingSummaryDto } from '@/bookings/application/dtos/booking-summary.dto';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '@/bookings/application/ports/booking-repository.port';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '@/rooms/application/ports/room-repository.port';
import { Booking } from '@/bookings/domain/booking.entity';
import {
  calculateNights,
  parseBookingDate,
} from '@/bookings/domain/booking-date.utils';

export interface UpdateBookingResult {
  booking: Booking;
}

@Injectable()
export class UpdateBookingUseCase {
  constructor(
    private readonly bookingFactory: BookingFactory,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
  ) {}

  async execute(id: string, dto: BookingSummaryDto): Promise<UpdateBookingResult> {
    const currentBooking = await this.bookingRepository.findById(id);
    if (!currentBooking) {
      throw new NotFoundException(`Reservation ${id} introuvable`);
    }

    const room = await this.roomRepository.findById(dto.roomId);
    if (!room) {
      throw new NotFoundException(`Chambre ${dto.roomId} introuvable`);
    }

    if (!room.isAvailable() && room.getId() !== currentBooking.getRoomId()) {
      throw new ConflictException(`La chambre ${dto.roomId} n'est pas disponible`);
    }

    let checkInDate: Date;
    let checkOutDate: Date;
    let nights: number;

    try {
      checkInDate = parseBookingDate(dto.checkInDate);
      checkOutDate = parseBookingDate(dto.checkOutDate);
      nights = calculateNights(checkInDate, checkOutDate);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Dates de reservation invalides',
      );
    }

    const conflicts = await this.bookingRepository.findRoomConflicts(
      dto.roomId,
      checkInDate,
      checkOutDate,
    );
    const blockingConflict = conflicts.find(
      (booking) => booking.getId() !== currentBooking.getId(),
    );

    if (blockingConflict) {
      throw new ConflictException(
        `La chambre ${dto.roomId} est deja reservee pour ces dates`,
      );
    }

    const updatedBooking = this.bookingFactory.reconstitute(
      currentBooking.getId(),
      room.getId(),
      dto.guestFirstName,
      dto.guestLastName,
      dto.guestEmail,
      checkInDate,
      checkOutDate,
      nights,
      room.getPrice().getAmount() * nights,
      room.getPrice().getCurrency(),
      currentBooking.getStatus(),
      dto.specialRequests,
      currentBooking.getCreatedAt(),
      new Date(),
    );

    return {
      booking: await this.bookingRepository.save(updatedBooking),
    };
  }
}
