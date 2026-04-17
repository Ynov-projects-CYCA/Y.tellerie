import { BookingStatus } from '@/bookings/domain/booking-status.vo';
import { RoomResponseDto } from '@/rooms/application/dtos/room-response.dto';

export class BookingResponseDto {
  id!: string;
  room!: RoomResponseDto;
  guestFirstName!: string;
  guestLastName!: string;
  guestEmail!: string;
  checkInDate!: Date;
  checkOutDate!: Date;
  nights!: number;
  totalPrice!: number;
  currency!: string;
  status!: BookingStatus;
  specialRequests?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
