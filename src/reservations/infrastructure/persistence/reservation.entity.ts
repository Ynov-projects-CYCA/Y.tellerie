import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('reservations')
export class ReservationEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'room_id' })
  roomId: string;

  @Column('timestamp with time zone', { name: 'start_date' })
  startDate: Date;

  @Column('timestamp with time zone', { name: 'end_date' })
  endDate: Date;

  @Column({ default: 'confirmed' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
