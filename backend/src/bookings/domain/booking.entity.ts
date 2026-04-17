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
    private status: BookingStatusVO,
    private readonly specialRequests?: string,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.roomId) {
      throw new Error("L'identifiant de la chambre est requis");
    }
    if (!this.guestFirstName.trim() || !this.guestLastName.trim()) {
      throw new Error('Le nom du client est requis');
    }
    if (!this.guestEmail.trim()) {
      throw new Error("L'email du client est requis");
    }
    if (this.checkOutDate <= this.checkInDate) {
      throw new Error("La date de depart doit etre posterieure a la date d'arrivee");
    }
    if (this.nights < 1) {
      throw new Error('La reservation doit etre au minimum dune nuit');
    }
    if (this.totalPrice < 0) {
      throw new Error('Le montant total de la reservation ne peut pas etre negatif');
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

  markConfirmed(): void {
    this.status = BookingStatusVO.confirmed();
    this.updatedAt = new Date();
  }

  markPaymentFailed(): void {
    this.status = BookingStatusVO.paymentFailed();
    this.updatedAt = new Date();
  }

  markCanceled(): void {
    this.status = BookingStatusVO.canceled();
    this.updatedAt = new Date();
  }

  overlaps(checkInDate: Date, checkOutDate: Date): boolean {
    return this.checkInDate < checkOutDate && this.checkOutDate > checkInDate;
  }
}
