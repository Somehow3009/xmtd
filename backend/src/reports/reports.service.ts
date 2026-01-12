import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { Shipment } from '../entities/shipment.entity';
import { Order } from '../entities/order.entity';
import { Customer } from '../entities/customer.entity';
import { ReportRangeDto } from './dto/report-range.dto';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export interface InvoiceReportItem {
  invoiceNo: string;
  customer: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue';
}

export interface ShipmentReportItem {
  code: string;
  product: string;
  quantity: number;
  pickupLocation: string;
  dropoffLocation: string;
  vehicle: string;
  date: string;
  status: 'draft' | 'scheduled' | 'delivered';
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice) private readonly invoicesRepo: Repository<Invoice>,
    @InjectRepository(Shipment) private readonly shipmentsRepo: Repository<Shipment>,
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Customer) private readonly customersRepo: Repository<Customer>,
  ) {}

  async getInvoices(filter?: ReportRangeDto): Promise<InvoiceReportItem[]> {
    const where: any = {};
    if (filter?.from && filter?.to) {
      where.dueDate = Between(filter.from, filter.to);
    }
    if (filter?.status) where.status = filter.status as any;
    return this.invoicesRepo.find({ where });
  }

  async getShipments(filter?: ReportRangeDto): Promise<ShipmentReportItem[]> {
    const where: any = {};
    if (filter?.status) where.status = filter.status as any;
    if (filter?.pickupLocation) where.pickupLocation = Like(`%${filter.pickupLocation}%`);
    if (filter?.dropoffLocation) where.dropoffLocation = Like(`%${filter.dropoffLocation}%`);
    if (filter?.from && filter?.to) {
      where.createdAt = Between(new Date(filter.from), new Date(filter.to));
    }
    const shipments = await this.shipmentsRepo.find({ where, relations: { order: true } });
    return shipments
      .filter((s) => {
        if (!filter?.product) return true;
        return (s.order?.product || '').toLowerCase().includes(filter.product.toLowerCase());
      })
      .map((s) => ({
      code: s.code,
      product: s.order?.product || '',
      quantity: s.order?.quantity || 0,
      pickupLocation: s.pickupLocation,
      dropoffLocation: s.dropoffLocation,
      vehicle: s.vehicle,
      date: (s.createdAt as any as Date)?.toISOString?.().slice(0, 10) || '',
      status: s.status,
    }));
  }

  async getShipmentDetails(filter?: ReportRangeDto) {
    const where: any = {};
    if (filter?.status) where.status = filter.status as any;
    if (filter?.pickupLocation) where.pickupLocation = Like(`%${filter.pickupLocation}%`);
    if (filter?.dropoffLocation) where.dropoffLocation = Like(`%${filter.dropoffLocation}%`);
    if (filter?.from && filter?.to) {
      where.createdAt = Between(new Date(filter.from), new Date(filter.to));
    }
    const shipments = await this.shipmentsRepo.find({ where, relations: { order: true } });
    return shipments
      .filter((s) => {
        if (!filter?.product) return true;
        return (s.order?.product || '').toLowerCase().includes(filter.product.toLowerCase());
      })
      .map((s) => ({
      code: s.code,
      product: s.order?.product || '',
      cementType: s.order?.cementType || '',
      quantity: s.order?.quantity || 0,
      deliveryMethod: s.order?.deliveryMethod || '',
      serviceType: s.order?.serviceType || '',
      transactionType: s.order?.transactionType || '',
      pickupLocation: s.pickupLocation,
      dropoffLocation: s.dropoffLocation,
      vehicle: s.vehicle,
      region: s.order?.region || '',
      store: s.order?.store || '',
      status: s.status,
      date: (s.createdAt as any as Date)?.toISOString?.().slice(0, 10) || '',
    }));
  }

  async getCustomerCreditReport() {
    const customers = await this.customersRepo.find();
    const invoices = await this.invoicesRepo.find();
    return customers.map((c) => {
      const unpaid = invoices
        .filter((i) => i.customer === c.name && i.status !== 'paid')
        .reduce((sum, i) => sum + i.amount, 0);
      return {
        customer: c.name,
        creditLimit: c.creditLimit,
        creditUsed: c.creditUsed,
        creditRemaining: c.creditLimit - c.creditUsed,
        unpaidAmount: unpaid,
      };
    });
  }

  async getCustomerInvoices(customer?: string) {
    const where: any = {};
    if (customer) where.customer = Like(`%${customer}%`);
    return this.invoicesRepo.find({ where });
  }

  async getInventoryReport() {
    const orders = await this.ordersRepo.find();
    const promo = orders.filter((o) => (o.transactionType || '').toLowerCase().includes('khuyến mại'));
    const consignment = orders.filter((o) => (o.transactionType || '').toLowerCase().includes('gửi kho'));
    const sumByCement = (list: Order[]) => {
      const map: Record<string, number> = {};
      list.forEach((o) => {
        const key = o.cementType || o.product || 'Unknown';
        map[key] = (map[key] || 0) + (o.quantity || 0);
      });
      return Object.entries(map).map(([cementType, quantity]) => ({ cementType, quantity }));
    };
    return {
      promotion: sumByCement(promo),
      consignment: sumByCement(consignment),
    };
  }

  toCsv(rows: Record<string, any>[], headers: string[]) {
    const lines = [headers.join(',')];
    rows.forEach((row) => {
      lines.push(
        headers
          .map((h) => {
            const val = row[h] ?? '';
            const escaped = String(val).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(','),
      );
    });
    return lines.join('\n');
  }

  async exportInvoicesCsv(filter?: ReportRangeDto) {
    const data = await this.getInvoices(filter);
    const csv = this.toCsv(data as any[], ['invoiceNo', 'customer', 'amount', 'dueDate', 'status']);
    return csv;
  }

  async exportShipmentsCsv(filter?: ReportRangeDto) {
    const data = await this.getShipments(filter);
    const csv = this.toCsv(data as any[], [
      'code',
      'product',
      'quantity',
      'pickupLocation',
      'dropoffLocation',
      'vehicle',
      'date',
      'status',
    ]);
    return csv;
  }

  async exportToExcel(rows: Record<string, any>[], headers: string[], sheetName: string) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);
    sheet.addRow(headers);
    rows.forEach((row) => {
      sheet.addRow(headers.map((h) => row[h]));
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async exportToPdf(rows: Record<string, any>[], headers: string[], title: string) {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.fontSize(16).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(headers.join(' | '));
    doc.moveDown(0.5);
    rows.forEach((row) => {
      const line = headers.map((h) => String(row[h] ?? '')).join(' | ');
      doc.text(line);
    });
    doc.end();
    return await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
