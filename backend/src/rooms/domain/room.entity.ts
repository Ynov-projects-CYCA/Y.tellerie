import { PriceVO } from './price.vo';
import { RoomStatusVO } from './room-status.vo';
import { RoomTypeVO } from './room-type.vo';

export class Room {
  constructor(
    private id: string,
    private roomNumber: string,
    private type: RoomTypeVO,
    private capacity: number,
    private price: PriceVO,
    private status: RoomStatusVO,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.roomNumber || this.roomNumber.trim().length === 0) {
      throw new Error('Room number is required');
    }
    if (this.capacity < 1 || this.capacity > 10) {
      throw new Error('Capacity must be between 1 and 10');
    }
  }

  getId(): string {
    return this.id;
  }

  getRoomNumber(): string {
    return this.roomNumber;
  }

  getType(): RoomTypeVO {
    return this.type;
  }

  getCapacity(): number {
    return this.capacity;
  }

  getPrice(): PriceVO {
    return this.price;
  }

  getStatus(): RoomStatusVO {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  isAvailable(): boolean {
    return this.status.isAvailable();
  }

  isOccupied(): boolean {
    return this.status.isOccupied();
  }

  isDirty(): boolean {
    return this.status.isDirty();
  }

  updateDetails(
    roomNumber?: string,
    type?: RoomTypeVO,
    capacity?: number,
    price?: PriceVO,
  ): void {
    if (roomNumber !== undefined) this.roomNumber = roomNumber;
    if (type !== undefined) this.type = type;
    if (capacity !== undefined) this.capacity = capacity;
    if (price !== undefined) this.price = price;
    this.updatedAt = new Date();
    this.validate();
  }

  updateStatus(status: RoomStatusVO): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  checkout(): void {
    if (!this.status.equals(RoomStatusVO.occupied())) {
      throw new Error('Only occupied rooms can be checked out');
    }
    this.status = RoomStatusVO.dirty();
    this.updatedAt = new Date();
  }

  clean(): void {
    if (!this.status.isDirty()) {
      throw new Error('Only dirty rooms can be cleaned');
    }
    this.status = RoomStatusVO.available();
    this.updatedAt = new Date();
  }

  occupy(): void {
    if (!this.status.isAvailable()) {
      throw new Error('Only available rooms can be occupied');
    }
    this.status = RoomStatusVO.occupied();
    this.updatedAt = new Date();
  }

  setMaintenance(): void {
    this.status = RoomStatusVO.maintenance();
    this.updatedAt = new Date();
  }
}
