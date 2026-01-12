import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  invoiceNo!: string;

  @Column()
  customer!: string;

  @Column('integer')
  amount!: number;

  @Column({ type: 'date' })
  dueDate!: string;

  @Column({ type: 'varchar' })
  status!: 'unpaid' | 'paid' | 'overdue';
}
