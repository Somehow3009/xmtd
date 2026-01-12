import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService, InvoiceReportItem, ShipmentReportItem } from './reports.service';
import { ReportRangeDto } from './dto/report-range.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DVKH')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('invoices')
  async invoices(@Query() _range: ReportRangeDto): Promise<InvoiceReportItem[]> {
    // Range is accepted for future filtering
    return this.reportsService.getInvoices(_range);
  }

  @Get('shipments')
  async shipments(@Query() _range: ReportRangeDto): Promise<ShipmentReportItem[]> {
    return this.reportsService.getShipments(_range);
  }

  @Get('invoices/export')
  async exportInvoices(@Query() _range: ReportRangeDto, @Res() res: Response) {
    const csv = await this.reportsService.exportInvoicesCsv(_range);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"invoices.csv\"');
    return res.send(csv);
  }

  @Get('shipments/export')
  async exportShipments(@Query() _range: ReportRangeDto, @Res() res: Response) {
    const csv = await this.reportsService.exportShipmentsCsv(_range);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"shipments.csv\"');
    return res.send(csv);
  }

  @Get('shipments/detail')
  async shipmentDetail(@Query() _range: ReportRangeDto) {
    return this.reportsService.getShipmentDetails(_range);
  }

  @Get('shipments/detail/export/xlsx')
  async exportShipmentDetailXlsx(@Query() _range: ReportRangeDto, @Res() res: Response) {
    const rows = await this.reportsService.getShipmentDetails(_range);
    const headers = [
      'code',
      'product',
      'cementType',
      'quantity',
      'deliveryMethod',
      'serviceType',
      'transactionType',
      'pickupLocation',
      'dropoffLocation',
      'vehicle',
      'region',
      'store',
      'status',
      'date',
    ];
    const buffer = await this.reportsService.exportToExcel(rows as any[], headers, 'ShipmentDetail');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=\"shipment-detail.xlsx\"');
    return res.send(buffer);
  }

  @Get('shipments/detail/export/pdf')
  async exportShipmentDetailPdf(@Query() _range: ReportRangeDto, @Res() res: Response) {
    const rows = await this.reportsService.getShipmentDetails(_range);
    const headers = ['code', 'product', 'quantity', 'pickupLocation', 'dropoffLocation', 'vehicle', 'status', 'date'];
    const buffer = await this.reportsService.exportToPdf(rows as any[], headers, 'Shipment Detail Report');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=\"shipment-detail.pdf\"');
    return res.send(buffer);
  }

  @Get('customers/credit')
  async customerCredit() {
    return this.reportsService.getCustomerCreditReport();
  }

  @Get('customers/credit/export/xlsx')
  async exportCustomerCreditXlsx(@Res() res: Response) {
    const rows = await this.reportsService.getCustomerCreditReport();
    const headers = ['customer', 'creditLimit', 'creditUsed', 'creditRemaining', 'unpaidAmount'];
    const buffer = await this.reportsService.exportToExcel(rows as any[], headers, 'CustomerCredit');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=\"customer-credit.xlsx\"');
    return res.send(buffer);
  }

  @Get('customers/credit/export/pdf')
  async exportCustomerCreditPdf(@Res() res: Response) {
    const rows = await this.reportsService.getCustomerCreditReport();
    const headers = ['customer', 'creditLimit', 'creditUsed', 'creditRemaining', 'unpaidAmount'];
    const buffer = await this.reportsService.exportToPdf(rows as any[], headers, 'Customer Credit Report');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=\"customer-credit.pdf\"');
    return res.send(buffer);
  }

  @Get('customers/invoices')
  async customerInvoices(@Query('customer') customer?: string) {
    return this.reportsService.getCustomerInvoices(customer);
  }

  @Get('customers/invoices/export/xlsx')
  async exportCustomerInvoicesXlsx(@Query('customer') customer: string | undefined, @Res() res: Response) {
    const rows = await this.reportsService.getCustomerInvoices(customer);
    const headers = ['invoiceNo', 'customer', 'amount', 'dueDate', 'status'];
    const buffer = await this.reportsService.exportToExcel(rows as any[], headers, 'CustomerInvoices');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=\"customer-invoices.xlsx\"');
    return res.send(buffer);
  }

  @Get('customers/invoices/export/pdf')
  async exportCustomerInvoicesPdf(@Query('customer') customer: string | undefined, @Res() res: Response) {
    const rows = await this.reportsService.getCustomerInvoices(customer);
    const headers = ['invoiceNo', 'customer', 'amount', 'dueDate', 'status'];
    const buffer = await this.reportsService.exportToPdf(rows as any[], headers, 'Customer Invoices');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=\"customer-invoices.pdf\"');
    return res.send(buffer);
  }

  @Get('inventory')
  async inventory() {
    return this.reportsService.getInventoryReport();
  }

  @Get('inventory/export/xlsx')
  async exportInventoryXlsx(@Res() res: Response) {
    const report = await this.reportsService.getInventoryReport();
    const rows = [
      ...report.promotion.map((r: any) => ({ category: 'Khuyến mại', ...r })),
      ...report.consignment.map((r: any) => ({ category: 'Gửi kho', ...r })),
    ];
    const headers = ['category', 'cementType', 'quantity'];
    const buffer = await this.reportsService.exportToExcel(rows as any[], headers, 'Inventory');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=\"inventory.xlsx\"');
    return res.send(buffer);
  }

  @Get('inventory/export/pdf')
  async exportInventoryPdf(@Res() res: Response) {
    const report = await this.reportsService.getInventoryReport();
    const rows = [
      ...report.promotion.map((r: any) => ({ category: 'Khuyến mại', ...r })),
      ...report.consignment.map((r: any) => ({ category: 'Gửi kho', ...r })),
    ];
    const headers = ['category', 'cementType', 'quantity'];
    const buffer = await this.reportsService.exportToPdf(rows as any[], headers, 'Inventory Report');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=\"inventory.pdf\"');
    return res.send(buffer);
  }
}
