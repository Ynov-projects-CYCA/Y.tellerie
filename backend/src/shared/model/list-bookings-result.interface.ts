import { Booking } from "@/bookings/domain/booking.entity";
import { Room } from "@/rooms/domain/room.entity";

export interface ListBookingsResult {
  booking: Booking;
  room: Room;
}
