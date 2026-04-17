import { randomUUID } from 'crypto';
import { Booking } from './booking.entity';
import { BookingStatusVO } from './booking-status.vo';

export class BookingFactory {
  createBooking(
    roomId: string,
    guestFirstName: string,
    guestLastName: string,
    guestEmail: string,
    checkInDate: Date,
    checkOutDate: Date,
    nights: number,
    totalPrice: number,
    currency: string,
    specialRequests?: string,
  ): Booking {
    return new Booking(
      randomUUID(),
      roomId,
      guestFirstName,
      guestLastName,
      guestEmail,
      checkInDate,
      checkOutDate,
      nights,
      totalPrice,
      currency,
      BookingStatusVO.pendingPayment(),
      specialRequests,
    );
  }

  reconstitute(
    id: string,
    roomId: string,
    guestFirstName: string,
    guestLastName: string,
    guestEmail: string,
    checkInDate: Date,
    checkOutDate: Date,
    nights: number,
    totalPrice: number,
    currency: string,
    status: BookingStatusVO,
    specialRequests: string | undefined,
    createdAt: Date,
    updatedAt: Date,
  ): Booking {
    return new Booking(
      id,
      roomId,
      guestFirstName,
      guestLastName,
      guestEmail,
      checkInDate,
      checkOutDate,
      nights,
      totalPrice,
      currency,
      status,
      specialRequests,
      createdAt,
      updatedAt,
    );
  }
}
