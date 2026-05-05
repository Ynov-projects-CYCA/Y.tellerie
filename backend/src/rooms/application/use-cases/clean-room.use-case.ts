import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROOM_REPOSITORY,
  RoomRepositoryPort,
} from '@/rooms/application/ports/room-repository.port';
import { Room } from '@/rooms/domain/room.entity';

@Injectable()
export class CleanRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: RoomRepositoryPort,
  ) {}

  async execute(id: string): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException(`Chambre introuvable pour l'identifiant ${id}`);
    }

    if (!room.isDirty()) {
      throw new Error(
        `La chambre ${id} n'est pas sale. Statut actuel : ${room.getStatus().getValue()}`,
      );
    }

    // Clean room and make it available
    room.clean();

    return await this.roomRepository.save(room);
  }
}
