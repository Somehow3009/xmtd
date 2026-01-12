import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { addDays, parseISO, isBefore } from 'date-fns';
import { Order } from '../entities/order.entity';
import { OrderFilterDto } from './dto/order-filter.dto';
import { Customer } from '../entities/customer.entity';
import { Price } from '../entities/price.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly repo: Repository<Order>,
    @InjectRepository(Customer) private readonly customers: Repository<Customer>,
    @InjectRepository(Price) private readonly prices: Repository<Price>,
  ) {}

  list(filter: OrderFilterDto, user?: any) {
    const where: any = {};
    if (filter.product) {
      where.product = Like(`%${filter.product}%`);
    }
    if (filter.status) {
      where.status = filter.status as any;
    }
    return this.repo.find({ where }).then((list) => {
      let result = list;
      if (user?.role === 'NPP') {
        const customerName = user.customerName;
        if (customerName) {
          result = result.filter((o) => o.customerName === customerName || o.customer === customerName);
        } else {
          result = [];
        }
      }
      if (filter.locked === 'true') {
        result = result.filter((o) => o.isLocked);
      }
      if (filter.expireSoon === 'true') {
        const now = new Date();
        result = result.filter((o) => {
          const exp = o.expiresAt ? parseISO(o.expiresAt) : parseISO(o.deliveryDate);
          return isBefore(exp, addDays(now, 3));
        });
      }
      return result;
    });
  }

  async create(payload: Partial<Order> & { customerId?: number; priceCementType?: string }, user: any) {
    if (user?.role === 'NPP') {
      if (!user.customerId) {
        throw new Error('Customer not linked to user');
      }
      payload.customerId = user.customerId;
    }
    if (!payload.customerId) {
      throw new Error('Customer is required');
    }
    const customer = await this.customers.findOne({ where: { id: payload.customerId } });
    if (!customer) throw new Error('Customer not found');
    const qty = payload.quantity || 0;
    if (Math.round(qty * 100) % 5 !== 0) {
      throw new Error('Quantity must be in 0.05 ton steps');
    }
    const cementType = payload.cementType || payload.priceCementType || '';
    const price =
      (await this.prices.findOne({
        where: {
          cementType,
          region: payload.region || undefined,
          location: payload.pickupLocation || undefined,
        },
      })) ||
      (await this.prices.findOne({
        where: { cementType, region: payload.region || undefined },
      })) ||
      (await this.prices.findOne({ where: { cementType } }));
    const amount = Math.round(qty * (price?.pricePerTon || 0));
    const creditRemaining = customer.creditLimit - customer.creditUsed;
    const approvalStatus: Order['approvalStatus'] =
      creditRemaining >= amount ? 'approved' : 'rejected';
    const creditHold = approvalStatus === 'approved' ? amount : 0;
    if (creditHold > 0) {
      customer.creditUsed += creditHold;
      await this.customers.save(customer);
    }
    const order = this.repo.create({
      ...payload,
      customer: customer.name,
      customerName: customer.name,
      approvalStatus,
      creditHold,
      status: approvalStatus === 'approved' ? 'confirmed' : 'draft',
      isLocked: approvalStatus === 'rejected',
    });
    return this.repo.save(order);
  }

  async approve(id: number, approve: boolean, approver: string) {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new Error('Order not found');
    order.approvalStatus = approve ? 'approved' : 'rejected';
    order.isLocked = !approve;
    order.approvedBy = approver;
    order.approvedAt = new Date();
    return this.repo.save(order);
  }
}
