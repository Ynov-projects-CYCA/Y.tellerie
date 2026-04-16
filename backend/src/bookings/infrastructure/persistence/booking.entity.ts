import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bookings')
export class BookingEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  roomId!: string;

  @Column()
  guestFirstName!: string;

  @Column()
  guestLastName!: string;

  @Column()
  guestEmail!: string;

  @Column({ type: 'date' })
  checkInDate!: string;

  @Column({ type: 'date' })
  checkOutDate!: string;

  @Column('int')
  nights!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ default: 'EUR' })
  currency!: string;

  @Column()
  status!: string;

  @Column({ type: 'text', nullable: true })
  specialRequests?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
