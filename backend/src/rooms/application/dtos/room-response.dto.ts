import { RoomType } from '@/rooms/domain/room-type.vo';
import { RoomStatus } from '@/rooms/domain/room-status.vo';

export class RoomResponseDto {
  id!: string;
  roomNumber!: string;
  type!: RoomType;
  capacity!: number;
  price!: number;
  currency!: string;
  status!: RoomStatus;
  createdAt!: Date;
  updatedAt!: Date;

  static fromDomain(room: any): RoomResponseDto {
    const dto = new RoomResponseDto();
    dto.id = room.getId();
    dto.roomNumber = room.getRoomNumber();
    dto.type = room.getType().getValue();
    dto.capacity = room.getCapacity();
    dto.price = room.getPrice().getAmount();
    dto.currency = room.getPrice().getCurrency();
    dto.status = room.getStatus().getValue();
    dto.createdAt = room.getCreatedAt();
    dto.updatedAt = room.getUpdatedAt();
    return dto;
  }
}
