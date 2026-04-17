import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { CreateRoomDto } from '@/rooms/application/dtos/create-room.dto';
import { RoomFactory } from '@/rooms/domain/room.factory';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '@/rooms/application/ports/room-repository.port';
import { RoomTypeVO } from '@/rooms/domain/room-type.vo';
import { PriceVO } from '@/rooms/domain/price.vo';
import { Room } from '@/rooms/domain/room.entity';

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
        `Le numero de chambre ${dto.roomNumber} existe deja`,
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
