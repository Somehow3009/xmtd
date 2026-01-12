import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(@InjectRepository(Invoice) private readonly repo: Repository<Invoice>) {}

  list(customer?: string, user?: any) {
    const where: any = {};
    if (customer) where.customer = Like(`%${customer}%`);
    if (user?.role === 'NPP') {
      if (user.customerName) {
        where.customer = Like(`%${user.customerName}%`);
      } else {
        return [];
      }
    }
    return this.repo.find({ where });
  }

  async createManual(dto: CreateInvoiceDto) {
    const invoice = this.repo.create({
      invoiceNo: dto.invoiceNo || `HD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: dto.customer,
      amount: dto.amount,
      dueDate: dto.dueDate,
      status: dto.status || 'unpaid',
    });
    return this.repo.save(invoice);
  }
}
