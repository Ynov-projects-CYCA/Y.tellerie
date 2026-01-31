import { Inject, Injectable } from '@nestjs/common';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '../ports/room-repository.port';
import { Room } from '../../domain/room.entity';

@Injectable()
export class ListRoomsUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
  ) {}

  async execute(): Promise<Room[]> {
    return await this.roomRepository.findAll();
  }
}
