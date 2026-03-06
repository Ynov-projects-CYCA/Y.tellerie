import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PriceVO } from './price.vo';
import { RoomStatusVO } from './room-status.vo';
import { RoomType, RoomTypeVO } from './room-type.vo';
import { Room } from './room.entity';

@Injectable()
export class RoomFactory {
  createRoom(
    roomNumber: string,
    type: RoomTypeVO,
    capacity: number,
    price: PriceVO,
    status?: RoomStatusVO,
    id?: string,
  ): Room {
    return new Room(
      id || uuidv4(),
      roomNumber,
      type,
      capacity,
      price,
      status || RoomStatusVO.available(),
      new Date(),
      new Date(),
    );
  }

  createSimpleRoom(roomNumber: string, priceAmount: number): Room {
    const type = RoomTypeVO.create(RoomType.SIMPLE);
    const capacity = 1;
    const price = PriceVO.create(priceAmount);

    return this.createRoom(roomNumber, type, capacity, price);
  }

  createDoubleRoom(roomNumber: string, priceAmount: number): Room {
    const type = RoomTypeVO.create(RoomType.DOUBLE);
    const capacity = 2;
    const price = PriceVO.create(priceAmount);

    return this.createRoom(roomNumber, type, capacity, price);
  }

  createSuiteRoom(
    roomNumber: string,
    priceAmount: number,
    capacity: number = 4,
  ): Room {
    const type = RoomTypeVO.create(RoomType.SUITE);
    const price = PriceVO.create(priceAmount);

    return this.createRoom(roomNumber, type, capacity, price);
  }

  reconstitute(
    id: string,
    roomNumber: string,
    type: RoomTypeVO,
    capacity: number,
    price: PriceVO,
    status: RoomStatusVO,
    createdAt: Date,
    updatedAt: Date,
  ): Room {
    return new Room(
      id,
      roomNumber,
      type,
      capacity,
      price,
      status,
      createdAt,
      updatedAt,
    );
  }
}
