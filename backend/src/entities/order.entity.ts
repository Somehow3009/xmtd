import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './customer.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  product!: string;

  @Column('int')
  quantity!: number;

  @Column({ type: 'varchar' })
  status!: 'draft' | 'confirmed' | 'shipped';

  @Column()
  customer!: string;

  @Column()
  distributor!: string;

  @Column({ type: 'date' })
  deliveryDate!: string;

  @Column({ type: 'date', nullable: true })
  expiresAt?: string;

  @Column({ default: false })
  isLocked!: boolean;

  @Column({ nullable: true })
  deliveryMethod?: string; // road, water

  @Column({ nullable: true })
  serviceType?: string; // bành võng / xuất xá bao

  @Column({ nullable: true })
  cementType?: string;

  @Column({ nullable: true })
  vehicle?: string;

  @Column({ nullable: true })
  trailer?: string;

  @Column({ nullable: true })
  transactionType?: string;

  @Column({ nullable: true })
  pickupLocation?: string;

  @Column({ nullable: true })
  store?: string;

  @Column({ nullable: true })
  region?: string;

  @Column({ type: 'varchar', default: 'pending' })
  approvalStatus!: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'integer', default: 0 })
  creditHold!: number; // VND reserved

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'datetime', nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  customerName?: string;
}
