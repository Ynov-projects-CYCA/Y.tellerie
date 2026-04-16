export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
}

export class BookingStatusVO {
  private constructor(private readonly value: BookingStatus) {}

  static create(status: string): BookingStatusVO {
    const upperStatus = status.toUpperCase();
    if (!Object.values(BookingStatus).includes(upperStatus as BookingStatus)) {
      throw new Error(`Invalid booking status: ${status}`);
    }
    return new BookingStatusVO(upperStatus as BookingStatus);
  }

  static confirmed(): BookingStatusVO {
    return new BookingStatusVO(BookingStatus.CONFIRMED);
  }

  getValue(): BookingStatus {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
