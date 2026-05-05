import { Booking } from '@/bookings/domain/booking.entity';

export interface BookingRepositoryPort {
  save(booking: Booking): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  findOverlapping(checkInDate: Date, checkOutDate: Date): Promise<Booking[]>;
  findRoomConflicts(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date,
  ): Promise<Booking[]>;
  findByGuestEmail(email: string): Promise<Booking[]>;
}

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');
