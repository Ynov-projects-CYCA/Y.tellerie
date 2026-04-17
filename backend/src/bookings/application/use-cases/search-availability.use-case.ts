import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '@/rooms/application/ports/room-repository.port';
import { Room } from '@/rooms/domain/room.entity';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '@/bookings/application/ports/booking-repository.port';
import { SearchAvailabilityQueryDto } from '@/bookings/application/dtos/search-availability-query.dto';
import {
  calculateNights,
  parseBookingDate,
} from '@/bookings/domain/booking-date.utils';

export interface AvailableRoomResult {
  room: Room;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  totalPrice: number;
  currency: string;
}

@Injectable()
export class SearchAvailabilityUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
  ) {}

  async execute(
    query: SearchAvailabilityQueryDto,
  ): Promise<AvailableRoomResult[]> {
    let checkInDate: Date;
    let checkOutDate: Date;

    try {
      checkInDate = parseBookingDate(query.checkInDate);
      checkOutDate = parseBookingDate(query.checkOutDate);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Dates de reservation invalides',
      );
    }

    let nights: number;
    try {
      nights = calculateNights(checkInDate, checkOutDate);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Dates de reservation invalides',
      );
    }

    const [rooms, overlappingBookings] = await Promise.all([
      this.roomRepository.findAll(),
      this.bookingRepository.findOverlapping(checkInDate, checkOutDate),
    ]);

    const bookedRoomIds = new Set(
      overlappingBookings.map((booking) => booking.getRoomId()),
    );

    return rooms
      .filter((room) => room.isAvailable())
      .filter((room) => !bookedRoomIds.has(room.getId()))
      .filter((room) =>
        query.capacity !== undefined
          ? room.getCapacity() >= query.capacity
          : true,
      )
      .filter((room) =>
        query.type !== undefined
          ? room.getType().getValue() === query.type
          : true,
      )
      .filter((room) =>
        query.maxPrice !== undefined
          ? room.getPrice().getAmount() <= query.maxPrice
          : true,
      )
      .map((room) => ({
        room,
        checkInDate,
        checkOutDate,
        nights,
        totalPrice: room.getPrice().getAmount() * nights,
        currency: room.getPrice().getCurrency(),
      }));
  }
}
