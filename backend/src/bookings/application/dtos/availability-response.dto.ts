import { RoomResponseDto } from '@/rooms/application/dtos/room-response.dto';

export class AvailabilityResponseDto {
  room!: RoomResponseDto;
  checkInDate!: Date;
  checkOutDate!: Date;
  nights!: number;
  totalPrice!: number;
  currency!: string;
}
