import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Invoice } from '../entities/invoice.entity';
import { Shipment } from '../entities/shipment.entity';
import { Order } from '../entities/order.entity';
import { Customer } from '../entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Shipment, Order, Customer])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
