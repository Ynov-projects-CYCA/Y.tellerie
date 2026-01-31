import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateRoomDto } from '../dtos/update-room.dto';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '../ports/room-repository.port';
import { RoomTypeVO } from '../../domain/room-type.vo';
import { PriceVO } from '../../domain/price.vo';
import { RoomStatusVO } from '../../domain/room-status.vo';
import { Room } from '../../domain/room.entity';

@Injectable()
export class UpdateRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
  ) {}

  async execute(id: string, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }

    const type = dto.type ? RoomTypeVO.create(dto.type) : undefined;
    const price =
      dto.price !== undefined
        ? PriceVO.create(dto.price, dto.currency || 'EUR')
        : undefined;

    room.updateDetails(dto.roomNumber, type, dto.capacity, price);

    if (dto.status) {
      const status = RoomStatusVO.create(dto.status);
      room.updateStatus(status);
    }

    return await this.roomRepository.save(room);
  }
}
