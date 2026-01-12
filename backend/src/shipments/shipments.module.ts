import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { OrdersModule } from '../orders/orders.module';
import { Shipment } from '../entities/shipment.entity';
import { Order } from '../entities/order.entity';
import { Price } from '../entities/price.entity';
import { Invoice } from '../entities/invoice.entity';
import { Customer } from '../entities/customer.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Order, Price, Invoice, Customer]), OrdersModule, MailModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
})
export class ShipmentsModule {}
