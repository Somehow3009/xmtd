import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Order } from './entities/order.entity';
import { Shipment } from './entities/shipment.entity';
import { Invoice } from './entities/invoice.entity';
import { Distributor } from './entities/distributor.entity';
import { CatalogItem } from './entities/catalog-item.entity';
import { Customer } from './entities/customer.entity';
import { Price } from './entities/price.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Shipment) private readonly shipments: Repository<Shipment>,
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(Distributor) private readonly distributors: Repository<Distributor>,
    @InjectRepository(CatalogItem) private readonly catalogs: Repository<CatalogItem>,
    @InjectRepository(Customer) private readonly customers: Repository<Customer>,
    @InjectRepository(Price) private readonly prices: Repository<Price>,
  ) {}

  async onApplicationBootstrap() {
    const shouldSeed = process.env.DB_SEED ? process.env.DB_SEED === 'true' : process.env.DB_TYPE !== 'postgres';
    if (!shouldSeed) return;
    await this.seedUsers();
    await this.seedDistributors();
    await this.seedCustomers();
    await this.linkUsersDistributors();
    await this.seedOrders();
    await this.seedShipments();
    await this.seedInvoices();
    await this.seedCatalogs();
    await this.seedPrices();
  }

  private async seedUsers() {
    const count = await this.users.count();
    if (count > 0) return;
    const pwd = await bcrypt.hash('password123', 8);
    await this.users.save([
      {
        username: 'dvkh1',
        passwordHash: pwd,
        role: 'DVKH',
        distributor: 'NPP An Phu',
        fullName: 'User DVKH 1',
      },
      {
        username: 'npp1',
        passwordHash: pwd,
        role: 'NPP',
        fullName: 'NPP An Phu',
      },
    ]);
  }

  private async seedDistributors() {
    const count = await this.distributors.count();
    if (count > 0) return;
    await this.distributors.save([
      { name: 'NPP An Phu' },
      { name: 'NPP Thu Duc' },
    ]);
  }

  private async linkUsersDistributors() {
    const dvkh = await this.users.findOne({ where: { username: 'dvkh1' }, relations: ['distributors'] });
    const npp = await this.users.findOne({ where: { username: 'npp1' }, relations: ['distributors', 'customer'] });
    const anPhu = await this.distributors.findOne({ where: { name: 'NPP An Phu' } });
    const thuDuc = await this.distributors.findOne({ where: { name: 'NPP Thu Duc' } });
    const cust = await this.customers.findOne({ where: { name: 'Đại lý An Phú' } });
    if (dvkh) {
      dvkh.distributors = [anPhu, thuDuc].filter(Boolean) as Distributor[];
      dvkh.distributor = anPhu?.name;
      await this.users.save(dvkh);
    }
    if (npp && anPhu) {
      npp.distributors = [anPhu];
      npp.distributor = anPhu.name;
      if (cust) {
        npp.customer = cust;
      }
      await this.users.save(npp);
    }
  }

  private async seedOrders() {
    const count = await this.orders.count();
    if (count > 0) return;
    await this.orders.save([
      {
        product: 'Xi măng PCB40',
        quantity: 120,
        status: 'confirmed',
        customer: 'DVKH 1',
        distributor: 'NPP An Phu',
        deliveryDate: '2025-01-05',
        expiresAt: '2025-01-07',
        isLocked: false,
        cementType: 'PCB40',
        deliveryMethod: 'Đường bộ',
        serviceType: 'Bành võng',
        transactionType: 'Hàng bán',
        pickupLocation: 'Nhà máy Tây Đô',
        region: 'Miền Nam',
        store: 'Cửa hàng A',
        approvalStatus: 'approved',
        creditHold: 0,
        customerName: 'Đại lý An Phú',
      },
      {
        product: 'Xi măng PCB50',
        quantity: 75,
        status: 'draft',
        customer: 'DVKH 1',
        distributor: 'NPP An Phu',
        deliveryDate: '2025-01-06',
        expiresAt: '2025-01-04',
        isLocked: true,
        cementType: 'PCB50',
        deliveryMethod: 'Đường thủy',
        serviceType: 'Xuất xá bao',
        transactionType: 'Hàng khuyến mại',
        pickupLocation: 'Kho Sadico',
        region: 'Miền Nam',
        store: 'Cửa hàng B',
        approvalStatus: 'rejected',
        creditHold: 0,
        customerName: 'Đại lý Thủ Đức',
      },
    ]);
  }

  private async seedShipments() {
    const count = await this.shipments.count();
    if (count > 0) return;
    const order = await this.orders.findOneBy({ id: 1 });
    if (!order) return;
    await this.shipments.save([
      {
        code: 'MSGH-2899',
        order,
        pickupLocation: 'Kho Phuoc Long',
        dropoffLocation: 'Cong trinh A',
        vehicle: '51C-12345',
        status: 'scheduled',
        notes: 'Nhận hàng sáng',
      },
    ]);
  }

  private async seedInvoices() {
    const count = await this.invoices.count();
    if (count > 0) return;
    await this.invoices.save([
      { invoiceNo: 'HD-001', customer: 'NPP An Phu', amount: 120_000_000, dueDate: '2025-01-10', status: 'unpaid' },
      { invoiceNo: 'HD-002', customer: 'DVKH 1', amount: 80_500_000, dueDate: '2025-01-05', status: 'paid' },
      { invoiceNo: 'HD-003', customer: 'NPP An Phu', amount: 45_000_000, dueDate: '2024-12-30', status: 'overdue' },
    ]);
  }

  private async seedCatalogs() {
    const existing = await this.catalogs.find();
    const existingKey = new Set(existing.map((c) => `${c.type}:${c.name}`));
    const items = [
      { type: 'deliveryMethod', name: 'Đường bộ' },
      { type: 'deliveryMethod', name: 'Đường thủy' },
      { type: 'serviceType', name: 'Bành võng' },
      { type: 'serviceType', name: 'Xuất xá bao' },
      { type: 'cementType', name: 'PCB40' },
      { type: 'cementType', name: 'PCB50' },
      { type: 'transactionType', name: 'Hàng bán' },
      { type: 'transactionType', name: 'Hàng chào' },
      { type: 'transactionType', name: 'Hàng biếu tặng' },
      { type: 'transactionType', name: 'Hàng khuyến mại' },
      { type: 'transactionType', name: 'Hàng khuyến mại 1' },
      { type: 'transactionType', name: 'Hàng gửi kho' },
      { type: 'transactionType', name: 'Hàng mua gửi kho' },
      { type: 'transactionType', name: 'Hàng khuyến mại gửi kho' },
      { type: 'location', name: 'Nhà máy Tây Đô' },
      { type: 'location', name: 'Kho Sadico' },
      { type: 'location', name: 'Kho Bình Chánh' },
      { type: 'location', name: 'Tây Đô - Trạm nghiền Hiệp Phước' },
      { type: 'location', name: 'Thăng Long – Trạm nghiền Hiệp Phước' },
      { type: 'location', name: 'Cảng Đồng Nai – Xuân Đào' },
      { type: 'location', name: 'Cảng Bình Dương – Nam Sơn' },
      { type: 'store', name: 'Cửa hàng A' },
      { type: 'store', name: 'Cửa hàng B' },
      { type: 'region', name: 'Miền Nam' },
    ];
    const toInsert = items.filter((i) => !existingKey.has(`${i.type}:${i.name}`));
    if (toInsert.length > 0) {
      await this.catalogs.save(toInsert);
    }
  }

  private async seedCustomers() {
    const count = await this.customers.count();
    if (count > 0) return;
    await this.customers.save([
      {
        name: 'Đại lý An Phú',
        taxCode: '031xxxx',
        address: 'An Phu',
        email: 'anphu@example.com',
        creditLimit: 500_000_000,
        creditUsed: 0,
      },
      {
        name: 'Đại lý Thủ Đức',
        taxCode: '032xxxx',
        address: 'Thủ Đức',
        email: 'thuduc@example.com',
        creditLimit: 300_000_000,
        creditUsed: 0,
      },
    ]);
  }

  private async seedPrices() {
    const count = await this.prices.count();
    if (count > 0) return;
    await this.prices.save([
      { cementType: 'PCB40', region: 'Miền Nam', location: 'Nhà máy Tây Đô', pricePerTon: 1400000 },
      { cementType: 'PCB50', region: 'Miền Nam', location: 'Kho Sadico', pricePerTon: 1500000 },
    ]);
  }
}
