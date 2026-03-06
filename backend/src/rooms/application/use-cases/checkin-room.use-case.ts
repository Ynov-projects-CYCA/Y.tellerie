import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '../ports/room-repository.port';
import { Room } from '../../domain/room.entity';

@Injectable()
export class CheckinRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
  ) {}

  async execute(id: string): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }
    if (!room.isAvailable()) {
      throw new Error(`Room with id ${id} is not available for check-in`);
    }

    // Mark room as occupied
    room.occupy();

    return await this.roomRepository.save(room);
  }
}
