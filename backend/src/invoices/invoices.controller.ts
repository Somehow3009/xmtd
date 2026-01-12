import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Roles('DVKH', 'NPP')
  list(@Query('customer') customer: string | undefined, @Req() req: any) {
    return this.invoicesService.list(customer, req.user);
  }

  @Post('manual')
  @Roles('DVKH')
  create(@Body() body: CreateInvoiceDto) {
    return this.invoicesService.createManual(body);
  }
}
