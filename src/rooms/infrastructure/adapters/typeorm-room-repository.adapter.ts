import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomRepositoryPort } from '../../application/ports/room-repository.port';
import { Room } from '../../domain/room.entity';
import { RoomEntity } from '../persistence/room.entity';
import { RoomFactory } from '../../domain/room.factory';
import { RoomTypeVO } from '../../domain/room-type.vo';
import { PriceVO } from '../../domain/price.vo';
import { RoomStatusVO } from '../../domain/room-status.vo';

@Injectable()
export class TypeOrmRoomRepositoryAdapter implements RoomRepositoryPort {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly repository: Repository<RoomEntity>,
    private readonly roomFactory: RoomFactory,
  ) {}

  async save(room: Room): Promise<Room> {
    const entity = this.toEntity(room);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Room | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByRoomNumber(roomNumber: string): Promise<Room | null> {
    const entity = await this.repository.findOne({ where: { roomNumber } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Room[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(roomNumber: string): Promise<boolean> {
    const count = await this.repository.count({ where: { roomNumber } });
    return count > 0;
  }

  private toEntity(room: Room): RoomEntity {
    const entity = new RoomEntity();
    entity.id = room.getId();
    entity.roomNumber = room.getRoomNumber();
    entity.type = room.getType().toString();
    entity.capacity = room.getCapacity();
    entity.price = room.getPrice().getAmount();
    entity.currency = room.getPrice().getCurrency();
    entity.status = room.getStatus().toString();
    entity.createdAt = room.getCreatedAt();
    entity.updatedAt = room.getUpdatedAt();
    return entity;
  }

  private toDomain(entity: RoomEntity): Room {
    return this.roomFactory.reconstitute(
      entity.id,
      entity.roomNumber,
      RoomTypeVO.create(entity.type),
      entity.capacity,
      PriceVO.create(entity.price, entity.currency),
      RoomStatusVO.create(entity.status),
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
