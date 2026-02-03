import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationEntity } from '../persistence/reservation.entity';
import { ReservationRepositoryPort } from '../../application/ports/reservation-repository.port';

@Injectable()
export class TypeOrmReservationRepositoryAdapter implements ReservationRepositoryPort {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly repository: Repository<ReservationEntity>,
  ) {}

  async findOverlapping(roomId: string, start: Date, end: Date): Promise<ReservationEntity[]> {
    return this.repository
      .createQueryBuilder('r')
      .where('r.roomId = :roomId', { roomId })
      .andWhere('NOT (r.endDate <= :start OR r.startDate >= :end)', { start, end })
      .andWhere("r.status != 'cancelled'")
      .getMany();
  }
}
