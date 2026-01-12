import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../entities/order.entity';
import { Customer } from '../entities/customer.entity';
import { Price } from '../entities/price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Customer, Price])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
