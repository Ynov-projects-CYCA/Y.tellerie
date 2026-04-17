export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  DIRTY = 'DIRTY',
  MAINTENANCE = 'MAINTENANCE',
}

export class RoomStatusVO {
  private constructor(private readonly value: RoomStatus) {}

  static create(status: string): RoomStatusVO {
    const upperStatus = status.toUpperCase();
    if (!Object.values(RoomStatus).includes(upperStatus as RoomStatus)) {
      throw new Error(`Statut de chambre invalide : ${status}`);
    }
    return new RoomStatusVO(upperStatus as RoomStatus);
  }

  static available(): RoomStatusVO {
    return new RoomStatusVO(RoomStatus.AVAILABLE);
  }

  static occupied(): RoomStatusVO {
    return new RoomStatusVO(RoomStatus.OCCUPIED);
  }

  static dirty(): RoomStatusVO {
    return new RoomStatusVO(RoomStatus.DIRTY);
  }

  static maintenance(): RoomStatusVO {
    return new RoomStatusVO(RoomStatus.MAINTENANCE);
  }

  getValue(): RoomStatus {
    return this.value;
  }

  isAvailable(): boolean {
    return this.value === RoomStatus.AVAILABLE;
  }

  isOccupied(): boolean {
    return this.value === RoomStatus.OCCUPIED;
  }

  isDirty(): boolean {
    return this.value === RoomStatus.DIRTY;
  }

  equals(other: RoomStatusVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
