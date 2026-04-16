import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '../ports/booking-repository.port';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '../../../rooms/application/ports/room-repository.port';
import { Booking } from '../../domain/booking.entity';
import { Room } from '../../../rooms/domain/room.entity';

export interface GetBookingResult {
  booking: Booking;
  room: Room;
}

@Injectable()
export class GetBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
  ) {}

  async execute(id: string): Promise<GetBookingResult> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    const room = await this.roomRepository.findById(booking.getRoomId());
    if (!room) {
      throw new NotFoundException(
        `Room with id ${booking.getRoomId()} not found for booking ${id}`,
      );
    }

    return { booking, room };
  }
}
