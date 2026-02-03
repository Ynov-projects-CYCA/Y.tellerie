import { Inject, Injectable } from '@nestjs/common';
import { RESERVATION_REPOSITORY, ReservationRepositoryPort } from '../ports/reservation-repository.port';

@Injectable()
export class CheckAvailabilityUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY) private readonly reservationRepo: ReservationRepositoryPort,
  ) {}

  async execute(roomId: string, start: Date, end: Date): Promise<{ available: boolean; conflicts: any[] }> {
    if (start >= end) throw new Error('Start must be before end');
    const conflicts = await this.reservationRepo.findOverlapping(roomId, start, end);
    return { available: conflicts.length === 0, conflicts };
  }
}
