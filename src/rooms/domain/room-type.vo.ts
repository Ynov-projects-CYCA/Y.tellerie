export enum RoomType {
  SIMPLE = 'SIMPLE',
  DOUBLE = 'DOUBLE',
  SUITE = 'SUITE',
}

export class RoomTypeVO {
  private constructor(private readonly value: RoomType) {}

  static create(type: string): RoomTypeVO {
    const upperType = type.toUpperCase();
    if (!Object.values(RoomType).includes(upperType as RoomType)) {
      throw new Error(`Invalid room type: ${type}`);
    }
    return new RoomTypeVO(upperType as RoomType);
  }

  getValue(): RoomType {
    return this.value;
  }

  equals(other: RoomTypeVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
