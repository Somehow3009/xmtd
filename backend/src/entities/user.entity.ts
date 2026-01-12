import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Distributor } from './distributor.entity';
import { Customer } from './customer.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'varchar' })
  role!: 'DVKH' | 'NPP';

  @Column({ nullable: true })
  distributor?: string;

  @Column()
  fullName!: string;

  @ManyToMany(() => Distributor, { cascade: true })
  @JoinTable()
  distributors?: Distributor[];

  @ManyToOne(() => Customer, { nullable: true })
  customer?: Customer;
}
