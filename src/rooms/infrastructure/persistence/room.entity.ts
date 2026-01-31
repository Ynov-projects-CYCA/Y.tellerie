import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('rooms')
export class RoomEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  roomNumber: string;

  @Column()
  type: string;

  @Column('int')
  capacity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
