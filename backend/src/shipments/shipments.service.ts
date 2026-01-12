import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShipmentFilterDto } from './dto/shipment-filter.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Order } from '../entities/order.entity';
import { Shipment } from '../entities/shipment.entity';
import { Price } from '../entities/price.entity';
import { Invoice } from '../entities/invoice.entity';
import { MailService } from '../mail/mail.service';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment) private readonly repo: Repository<Shipment>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Price) private readonly prices: Repository<Price>,
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(Customer) private readonly customers: Repository<Customer>,
    private readonly mailService: MailService,
  ) {}

  list(filter: ShipmentFilterDto = {}, user?: any) {
    const where: any = {};
    if (filter.orderId) where.order = { id: Number(filter.orderId) };
    if (filter.code) where.code = Like(`%${filter.code}%`);
    if (filter.vehicle) where.vehicle = Like(`%${filter.vehicle}%`);
    if (filter.pickupLocation) where.pickupLocation = Like(`%${filter.pickupLocation}%`);
    if (filter.dropoffLocation) where.dropoffLocation = Like(`%${filter.dropoffLocation}%`);
    if (filter.status) where.status = filter.status as any;
    if (filter.inspectionStatus) where.inspectionStatus = filter.inspectionStatus as any;
    if (filter.from && filter.to) {
      where.createdAt = Between(new Date(filter.from), new Date(filter.to));
    }
    const query = this.repo.find({
      where,
      relations: { order: true },
      order: { createdAt: 'DESC' },
    });
    return query.then((items) => {
      let result = items;
      if (user?.role === 'NPP') {
        if (user.customerName) {
          result = result.filter((i) => i.order?.customerName === user.customerName || i.order?.customer === user.customerName);
        } else {
          result = [];
        }
      }
      if (filter.received === 'true') {
        result = result.filter((i) => i.status === 'delivered');
      }
      if (filter.received === 'false') {
        result = result.filter((i) => i.status !== 'delivered');
      }
      if (filter.product) {
        result = result.filter((i) => i.order?.product?.toLowerCase().includes(filter.product!.toLowerCase()));
      }
      return result;
    });
  }

  create(order: Order | undefined, payload: CreateShipmentDto) {
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const code = `MSGH-${Math.floor(2000 + Math.random() * 5000)}`;
    const shipment = this.repo.create({
      order,
      code,
      pickupLocation: payload.pickupLocation,
      dropoffLocation: payload.dropoffLocation,
      vehicle: payload.vehicle,
      status: 'draft',
      notes: payload.notes,
    });
    return this.repo.save(shipment);
  }

  async findOrder(id: number) {
    const order = await this.orders.findOne({ where: { id } });
    return order ?? undefined;
  }

  async update(id: number, payload: UpdateShipmentDto) {
    const shipment = await this.repo.findOne({ where: { id }, relations: { order: true } });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }
    if (payload.orderId) {
      const order = await this.findOrder(payload.orderId);
      if (order) {
        shipment.order = order;
      }
    }
    if (payload.pickupLocation) shipment.pickupLocation = payload.pickupLocation;
    if (payload.dropoffLocation) shipment.dropoffLocation = payload.dropoffLocation;
    if (payload.vehicle) shipment.vehicle = payload.vehicle;
    if (payload.status) shipment.status = payload.status;
    if (payload.notes !== undefined) shipment.notes = payload.notes;
    return this.repo.save(shipment);
  }

  async remove(id: number) {
    const shipment = await this.repo.findOne({ where: { id } });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }
    await this.repo.remove(shipment);
    return { deleted: true };
  }

  async copy(id: number) {
    const shipment = await this.repo.findOne({ where: { id }, relations: { order: true } });
    if (!shipment) throw new NotFoundException('Shipment not found');
    const duplicate = this.repo.create({
      order: shipment.order,
      code: `MSGH-${Math.floor(2000 + Math.random() * 5000)}`,
      pickupLocation: shipment.pickupLocation,
      dropoffLocation: shipment.dropoffLocation,
      vehicle: shipment.vehicle,
      status: 'draft',
      notes: shipment.notes,
    });
    return this.repo.save(duplicate);
  }

  async inspect(id: number, approve: boolean, inspector: string) {
    const shipment = await this.repo.findOne({ where: { id } });
    if (!shipment) throw new NotFoundException('Shipment not found');
    shipment.inspectionStatus = approve ? 'approved' : 'rejected';
    shipment.inspectedBy = inspector;
    shipment.inspectedAt = new Date();
    return this.repo.save(shipment);
  }

  async checkCode(code: string) {
    const shipment = await this.repo.findOne({ where: { code }, relations: { order: true } });
    return shipment;
  }

  async receiveAndInvoice(id: number, receiver: string) {
    const shipment = await this.repo.findOne({ where: { id }, relations: { order: true } });
    if (!shipment) throw new NotFoundException('Shipment not found');
    if (shipment.inspectionStatus !== 'approved') {
      throw new BadRequestException('Shipment not approved for receiving');
    }
    shipment.status = 'delivered';
    shipment.receivedAt = new Date();
    shipment.receivedBy = receiver;
    await this.repo.save(shipment);
    const order = shipment.order;
    if (!order) return { shipment, invoice: null };
    order.status = 'shipped';
    await this.orders.save(order);
    const cementType = order.cementType || order.product;
    const price =
      (await this.prices.findOne({
        where: {
          cementType,
          region: order.region || undefined,
          location: order.pickupLocation || undefined,
        },
      })) ||
      (await this.prices.findOne({
        where: { cementType, region: order.region || undefined },
      })) ||
      (await this.prices.findOne({ where: { cementType } }));
    const amount = Math.round((order.quantity || 0) * (price?.pricePerTon || 0));
    const invoice = this.invoices.create({
      invoiceNo: `HD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: order.customerName || order.customer,
      amount,
      dueDate: order.deliveryDate,
      status: 'unpaid',
    });
    const saved = await this.invoices.save(invoice);
    const customer = order.customerName
      ? await this.customers.findOne({ where: { name: order.customerName } })
      : null;
    const emailTarget = customer?.email;
    if (emailTarget) {
      await this.mailService.sendInvoice(
        emailTarget,
        `Hóa đơn ${saved.invoiceNo}`,
        `Khách hàng: ${saved.customer}\nSố tiền: ${saved.amount}\nHạn: ${saved.dueDate}`,
      );
    }
    return { shipment, invoice: saved };
  }
}
