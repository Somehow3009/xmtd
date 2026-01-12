import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { ReportsModule } from './reports/reports.module';
import { CatalogModule } from './catalog/catalog.module';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { MailModule } from './mail/mail.module';
import { User } from './entities/user.entity';
import { Order } from './entities/order.entity';
import { Shipment } from './entities/shipment.entity';
import { Invoice } from './entities/invoice.entity';
import { Distributor } from './entities/distributor.entity';
import { CatalogItem } from './entities/catalog-item.entity';
import { Customer } from './entities/customer.entity';
import { Price } from './entities/price.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE || (process.env.DATABASE_URL ? 'postgres' : 'sqlite')) as any,
      url: process.env.DATABASE_URL,
      host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
      port: process.env.DATABASE_URL ? undefined : (process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined),
      username: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
      password: process.env.DATABASE_URL ? undefined : process.env.DB_PASS,
      database:
        process.env.DATABASE_URL
          ? undefined
          : ((process.env.DB_TYPE || 'sqlite') === 'postgres'
              ? (process.env.DB_NAME || 'xmtd')
              : (process.env.DB_NAME || 'data.sqlite')),
      entities: [User, Order, Shipment, Invoice, Distributor, CatalogItem, Customer, Price],
      synchronize:
        process.env.DB_SYNC === 'true' ||
        (process.env.DB_TYPE || 'sqlite') === 'sqlite',
      logging: process.env.DB_LOGGING === 'true',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forFeature([User, Order, Shipment, Invoice, Distributor, CatalogItem, Customer, Price]),
    AuthModule,
    OrdersModule,
    ShipmentsModule,
    ReportsModule,
    CatalogModule,
    CustomersModule,
    InvoicesModule,
    MailModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
