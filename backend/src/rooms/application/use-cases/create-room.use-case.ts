import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { CreateRoomDto } from '../dtos/create-room.dto';
import { RoomFactory } from '../../domain/room.factory';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '../ports/room-repository.port';
import { RoomTypeVO } from '../../domain/room-type.vo';
import { PriceVO } from '../../domain/price.vo';
import { Room } from '../../domain/room.entity';

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
    private readonly roomFactory: RoomFactory,
  ) {}

  async execute(dto: CreateRoomDto): Promise<Room> {
    // Verify room number doesn't already exist
    const exists = await this.roomRepository.exists(dto.roomNumber);
    if (exists) {
      throw new ConflictException(
        `Room number ${dto.roomNumber} already exists`,
      );
    }

    const type = RoomTypeVO.create(dto.type);
    const price = PriceVO.create(dto.price, dto.currency);

    const room = this.roomFactory.createRoom(
      dto.roomNumber,
      type,
      dto.capacity,
      price,
    );

    return await this.roomRepository.save(room);
  }
}
