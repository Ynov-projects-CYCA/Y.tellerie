import { RoomResponseDto } from '@/rooms/application/dtos/room-response.dto';

export class BookingSummaryResponseDto {
  room!: RoomResponseDto;
  guestFirstName!: string;
  guestLastName!: string;
  guestEmail!: string;
  checkInDate!: Date;
  checkOutDate!: Date;
  nights!: number;
  totalPrice!: number;
  currency!: string;
  specialRequests?: string;
}
