import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingRepositoryPort } from '@/bookings/application/ports/booking-repository.port';
import { Booking } from '@/bookings/domain/booking.entity';
import { BookingEntity } from '@/bookings/infrastructure/persistence/booking.entity';
import { BookingFactory } from '@/bookings/domain/booking.factory';
import { BookingStatus, BookingStatusVO } from '@/bookings/domain/booking-status.vo';

@Injectable()
export class TypeOrmBookingRepositoryAdapter implements BookingRepositoryPort {
  private readonly pendingPaymentHoldMinutes = 15;

  constructor(
    @InjectRepository(BookingEntity)
    private readonly repository: Repository<BookingEntity>,
    private readonly bookingFactory: BookingFactory,
  ) {}

  async save(booking: Booking): Promise<Booking> {
    const entity = this.toEntity(booking);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Booking | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Booking[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findOverlapping(
    checkInDate: Date,
    checkOutDate: Date,
  ): Promise<Booking[]> {
    const entities = await this.repository
      .createQueryBuilder('booking')
      .where('booking.checkInDate < :checkOutDate', {
        checkOutDate: this.toDateColumn(checkOutDate),
      })
      .andWhere('booking.checkOutDate > :checkInDate', {
        checkInDate: this.toDateColumn(checkInDate),
      })
      .andWhere(this.blockingStatusCondition(), this.blockingStatusParams())
      .getMany();

    return entities.map((entity) => this.toDomain(entity));
  }

  async findRoomConflicts(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date,
  ): Promise<Booking[]> {
    const entities = await this.repository
      .createQueryBuilder('booking')
      .where('booking.roomId = :roomId', { roomId })
      .andWhere('booking.checkInDate < :checkOutDate', {
        checkOutDate: this.toDateColumn(checkOutDate),
      })
      .andWhere('booking.checkOutDate > :checkInDate', {
        checkInDate: this.toDateColumn(checkInDate),
      })
      .andWhere(this.blockingStatusCondition(), this.blockingStatusParams())
      .getMany();

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByGuestEmail(email: string): Promise<Booking[]> {
    const entities = await this.repository.find({
      where: { guestEmail: email },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }


  private toEntity(booking: Booking): BookingEntity {
    const entity = new BookingEntity();
    entity.id = booking.getId();
    entity.roomId = booking.getRoomId();
    entity.guestFirstName = booking.getGuestFirstName();
    entity.guestLastName = booking.getGuestLastName();
    entity.guestEmail = booking.getGuestEmail();
    entity.checkInDate = this.toDateColumn(booking.getCheckInDate());
    entity.checkOutDate = this.toDateColumn(booking.getCheckOutDate());
    entity.nights = booking.getNights();
    entity.totalPrice = booking.getTotalPrice();
    entity.currency = booking.getCurrency();
    entity.status = booking.getStatus().toString();
    entity.specialRequests = booking.getSpecialRequests();
    entity.createdAt = booking.getCreatedAt();
    entity.updatedAt = booking.getUpdatedAt();
    return entity;
  }

  private toDomain(entity: BookingEntity): Booking {
    return this.bookingFactory.reconstitute(
      entity.id,
      entity.roomId,
      entity.guestFirstName,
      entity.guestLastName,
      entity.guestEmail,
      new Date(`${entity.checkInDate}T00:00:00.000Z`),
      new Date(`${entity.checkOutDate}T00:00:00.000Z`),
      entity.nights,
      Number(entity.totalPrice),
      entity.currency,
      BookingStatusVO.create(entity.status),
      entity.specialRequests,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toDateColumn(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private blockingStatusCondition(): string {
    return `(${[
      'booking.status IN (:...blockingStatuses)',
      '(booking.status = :pendingPaymentStatus AND booking.createdAt >= :pendingPaymentHoldCutoff)',
    ].join(' OR ')})`;
  }

  private blockingStatusParams(): {
    blockingStatuses: BookingStatus[];
    pendingPaymentStatus: BookingStatus;
    pendingPaymentHoldCutoff: Date;
  } {
    return {
      blockingStatuses: [
        BookingStatus.CONFIRMED,
        BookingStatus.REFUND_REQUESTED,
      ],
      pendingPaymentStatus: BookingStatus.PENDING_PAYMENT,
      pendingPaymentHoldCutoff: new Date(
        Date.now() - this.pendingPaymentHoldMinutes * 60_000,
      ),
    };
  }
}
