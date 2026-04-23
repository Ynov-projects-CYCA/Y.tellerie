import { Inject, Injectable } from '@nestjs/common';
import {BOOKING_REPOSITORY, BookingRepositoryPort} from "@/bookings/application/ports/booking-repository.port";
import {ROOM_REPOSITORY, RoomRepositoryPort} from "@/rooms/application/ports/room-repository.port";
import { ListBookingsResult } from "@/shared/model";

@Injectable()
export class ListBookingsUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
  ) {}

  async execute(email: string): Promise<ListBookingsResult[]> {
    const bookings = await this.bookingRepository.findByGuestEmail(email);
    
    const results = await Promise.all(
      bookings.map(async (booking) => {
        const room = await this.roomRepository.findById(booking.getRoomId());
        return { booking, room: room! };
      })
    );

    return results;
  }
}
