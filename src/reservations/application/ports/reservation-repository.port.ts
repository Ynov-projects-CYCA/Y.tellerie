import { ReservationEntity } from '../../infrastructure/persistence/reservation.entity';

export interface ReservationRepositoryPort {
  findOverlapping(roomId: string, start: Date, end: Date): Promise<ReservationEntity[]>;
}

export const RESERVATION_REPOSITORY = Symbol('RESERVATION_REPOSITORY');
