import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class Shipment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  code!: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order!: Order;

  @Column()
  pickupLocation!: string;

  @Column()
  dropoffLocation!: string;

  @Column()
  vehicle!: string;

  @Column({ type: 'varchar' })
  status!: 'draft' | 'scheduled' | 'delivered';

  @Column({ type: 'varchar', default: 'pending' })
  inspectionStatus!: 'pending' | 'approved' | 'rejected';

  @Column({ nullable: true })
  inspectedBy?: string;

  @Column({ nullable: true })
  inspectedAt?: Date;

  @Column({ nullable: true })
  receivedBy?: string;

  @Column({ nullable: true })
  receivedAt?: Date;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
