import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Price {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cementType!: string;

  @Column({ nullable: true })
  region?: string;

  @Column({ nullable: true })
  location?: string;

  @Column('integer')
  pricePerTon!: number;
}
