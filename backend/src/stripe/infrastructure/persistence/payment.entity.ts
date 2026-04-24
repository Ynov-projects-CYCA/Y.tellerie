import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payments')
export class PaymentEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('IDX_PAYMENTS_BOOKING_ID')
  @Column('uuid')
  bookingId!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  status!: string;

  @Column('int')
  amount!: number;

  @Column()
  currency!: string;

  @Column({ nullable: true })
  customerEmail?: string;

  @Index('IDX_PAYMENTS_CHECKOUT_SESSION_ID', { unique: true })
  @Column({ nullable: true })
  checkoutSessionId?: string;

  @Index('IDX_PAYMENTS_PAYMENT_INTENT_ID', { unique: true })
  @Column({ nullable: true })
  paymentIntentId?: string;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
