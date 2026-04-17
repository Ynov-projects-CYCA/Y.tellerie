import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '@/rooms/application/ports/room-repository.port';
import { Room } from '@/rooms/domain/room.entity';
import { BookingSummaryDto } from '@/bookings/application/dtos/booking-summary.dto';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '@/bookings/application/ports/booking-repository.port';
import {
  calculateNights,
  parseBookingDate,
} from '@/bookings/domain/booking-date.utils';

export interface BookingSummaryResult {
  room: Room;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  totalPrice: number;
  currency: string;
  specialRequests?: string;
}

@Injectable()
export class GetBookingSummaryUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
  ) {}

  async execute(dto: BookingSummaryDto): Promise<BookingSummaryResult> {
    const room = await this.roomRepository.findById(dto.roomId);
    if (!room) {
      throw new NotFoundException(
        `Chambre introuvable pour l'identifiant ${dto.roomId}`,
      );
    }

    if (!room.isAvailable()) {
      throw new ConflictException(
        `La chambre ${dto.roomId} n'est pas disponible pour une reservation`,
      );
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
      room.getId(),
      checkInDate,
      checkOutDate,
    );

    if (conflicts.length > 0) {
      throw new ConflictException(
        `La chambre ${dto.roomId} est deja reservee pour ces dates`,
      );
    }

    return {
      room,
      guestFirstName: dto.guestFirstName,
      guestLastName: dto.guestLastName,
      guestEmail: dto.guestEmail,
      checkInDate,
      checkOutDate,
      nights,
      totalPrice: room.getPrice().getAmount() * nights,
      currency: room.getPrice().getCurrency(),
      specialRequests: dto.specialRequests,
    };
  }
}
