export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CANCELED = 'CANCELED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUNDED = 'REFUNDED',
}

export class BookingStatusVO {
  private constructor(private readonly value: BookingStatus) {}

  static create(status: string): BookingStatusVO {
    const upperStatus = status.toUpperCase();
    if (!Object.values(BookingStatus).includes(upperStatus as BookingStatus)) {
      throw new Error(`Statut de reservation invalide : ${status}`);
    }
    return new BookingStatusVO(upperStatus as BookingStatus);
  }

  static confirmed(): BookingStatusVO {
    return new BookingStatusVO(BookingStatus.CONFIRMED);
  }

  static pendingPayment(): BookingStatusVO {
    return new BookingStatusVO(BookingStatus.PENDING_PAYMENT);
  }

  static paymentFailed(): BookingStatusVO {
    return new BookingStatusVO(BookingStatus.PAYMENT_FAILED);
  }

  static canceled(): BookingStatusVO {
    return new BookingStatusVO(BookingStatus.CANCELED);
  }

  static refundRequested(): BookingStatusVO {
    return new BookingStatusVO(BookingStatus.REFUND_REQUESTED);
  }

  static refunded(): BookingStatusVO {
    return new BookingStatusVO(BookingStatus.REFUNDED);
  }

  getValue(): BookingStatus {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
