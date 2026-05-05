import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentRepositoryPort } from '@/stripe/application/ports/payment-repository.port';
import { Payment } from '@/stripe/domain/payment.entity';
import { PaymentStatus } from '@/stripe/domain/payment-status.vo';
import { Money } from '@/stripe/domain/money.vo';
import { PaymentEntity } from '@/stripe/infrastructure/persistence/payment.entity';

@Injectable()
export class TypeOrmPaymentRepositoryAdapter implements PaymentRepositoryPort {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repository: Repository<PaymentEntity>,
  ) {}

  async save(payment: Payment): Promise<Payment> {
    const entity = this.toEntity(payment);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Payment | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCheckoutSessionId(sessionId: string): Promise<Payment | null> {
    const entity = await this.repository.findOne({
      where: { checkoutSessionId: sessionId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findLatestByBookingId(bookingId: string): Promise<Payment | null> {
    const entity = await this.repository.findOne({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
    return entity ? this.toDomain(entity) : null;
  }

  private toEntity(payment: Payment): PaymentEntity {
    const props = payment.getProperties();
    const entity = new PaymentEntity();
    entity.id = props.id;
    entity.bookingId = props.bookingId;
    entity.description = props.description;
    entity.status = props.status;
    entity.amount = props.amount.getAmount();
    entity.currency = props.amount.getCurrency();
    entity.customerEmail = props.customerEmail;
    entity.checkoutSessionId = props.checkoutSessionId;
    entity.paymentIntentId = props.paymentIntentId;
    entity.failureReason = props.failureReason;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(entity: PaymentEntity): Payment {
    return Payment.reconstitute({
      id: entity.id,
      bookingId: entity.bookingId,
      description: entity.description,
      status: entity.status as PaymentStatus,
      amount: Money.create(entity.amount, entity.currency),
      customerEmail: entity.customerEmail,
      checkoutSessionId: entity.checkoutSessionId,
      paymentIntentId: entity.paymentIntentId,
      failureReason: entity.failureReason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
