import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CatalogItem {
  @PrimaryGeneratedColumn()
  id!: number;

  // type: cementType | deliveryMethod | serviceType | transactionType | location | store | region
  @Column()
  type!: string;

  @Column()
  name!: string;
}
