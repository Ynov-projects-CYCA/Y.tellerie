import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '../ports/room-repository.port';
import { Room } from '../../domain/room.entity';

@Injectable()
export class CheckoutRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
  ) {}

  async execute(id: string): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }

    if (!room.isOccupied()) {
      throw new Error(
        `Room with id ${id} is not occupied. Current status: ${room.getStatus().getValue()}`,
      );
    }

    // Mark room as dirty after checkout
    room.checkout();

    return await this.roomRepository.save(room);
  }
}
