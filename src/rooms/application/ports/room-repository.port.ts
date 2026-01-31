import { Room } from '../../domain/room.entity';

export interface RoomRepositoryPort {
  save(room: Room): Promise<Room>;
  findById(id: string): Promise<Room | null>;
  findByRoomNumber(roomNumber: string): Promise<Room | null>;
  findAll(): Promise<Room[]>;
  delete(id: string): Promise<void>;
  exists(roomNumber: string): Promise<boolean>;
}

export const ROOM_REPOSITORY = Symbol('ROOM_REPOSITORY');
