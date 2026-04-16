import { BookingStatusVO } from './booking-status.vo';

export class Booking {
  constructor(
    private readonly id: string,
    private readonly roomId: string,
    private readonly guestFirstName: string,
    private readonly guestLastName: string,
    private readonly guestEmail: string,
    private readonly checkInDate: Date,
    private readonly checkOutDate: Date,
    private readonly nights: number,
    private readonly totalPrice: number,
    private readonly currency: string,
    private readonly status: BookingStatusVO,
    private readonly specialRequests?: string,
    private readonly createdAt: Date = new Date(),
    private readonly updatedAt: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.roomId) {
      throw new Error('Room id is required');
    }
    if (!this.guestFirstName.trim() || !this.guestLastName.trim()) {
      throw new Error('Guest name is required');
    }
    if (!this.guestEmail.trim()) {
      throw new Error('Guest email is required');
    }
    if (this.checkOutDate <= this.checkInDate) {
      throw new Error('Check-out date must be after check-in date');
    }
    if (this.nights < 1) {
      throw new Error('Booking must be at least one night');
    }
    if (this.totalPrice < 0) {
      throw new Error('Booking total cannot be negative');
    }
  }

  getId(): string {
    return this.id;
  }

  getRoomId(): string {
    return this.roomId;
  }

  getGuestFirstName(): string {
    return this.guestFirstName;
  }

  getGuestLastName(): string {
    return this.guestLastName;
  }

  getGuestEmail(): string {
    return this.guestEmail;
  }

  getCheckInDate(): Date {
    return this.checkInDate;
  }

  getCheckOutDate(): Date {
    return this.checkOutDate;
  }

  getNights(): number {
    return this.nights;
  }

  getTotalPrice(): number {
    return this.totalPrice;
  }

  getCurrency(): string {
    return this.currency;
  }

  getStatus(): BookingStatusVO {
    return this.status;
  }

  getSpecialRequests(): string | undefined {
    return this.specialRequests;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  overlaps(checkInDate: Date, checkOutDate: Date): boolean {
    return this.checkInDate < checkOutDate && this.checkOutDate > checkInDate;
  }
}
