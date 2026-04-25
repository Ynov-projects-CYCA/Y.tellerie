import { Room } from './room.model';

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CANCELED = 'CANCELED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUNDED = 'REFUNDED',
}

export interface AvailabilityResponse {
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalPrice: number;
  currency: string;
}

export interface BookingSummaryRequest {
  roomId: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  specialRequests?: string;
}

export interface BookingSummaryResponse {
  room: Room;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalPrice: number;
  currency: string;
  specialRequests?: string;
}

export interface Booking {
  id: string;
  room: Room;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}
