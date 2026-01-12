import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { OrdersService } from '../orders/orders.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShipmentFilterDto } from './dto/shipment-filter.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('shipments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShipmentsController {
  constructor(
    private readonly shipmentsService: ShipmentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  @Roles('DVKH', 'NPP')
  list(@Query() query: ShipmentFilterDto, @Req() req: any) {
    return this.shipmentsService.list(query, req.user);
  }

  @Post()
  @Roles('DVKH')
  create(@Body() body: CreateShipmentDto) {
    return this.shipmentsService.findOrder(body.orderId).then((order) => this.shipmentsService.create(order, body));
  }

  @Patch(':id')
  @Roles('DVKH')
  update(@Param('id') id: string, @Body() body: UpdateShipmentDto) {
    return this.shipmentsService.update(Number(id), body);
  }

  @Delete(':id')
  @Roles('DVKH')
  delete(@Param('id') id: string) {
    return this.shipmentsService.remove(Number(id));
  }

  @Post(':id/copy')
  @Roles('DVKH')
  copy(@Param('id') id: string) {
    return this.shipmentsService.copy(Number(id));
  }

  @Post(':id/receive')
  @Roles('DVKH')
  receive(@Param('id') id: string, @Req() req: any) {
    return this.shipmentsService.receiveAndInvoice(Number(id), req.user.username);
  }

  @Post(':id/inspect')
  @Roles('DVKH')
  inspect(@Param('id') id: string, @Body() body: { approve: boolean }, @Req() req: any) {
    return this.shipmentsService.inspect(Number(id), body.approve, req.user.username);
  }

  @Get('check/code')
  @Roles('DVKH', 'NPP')
  check(@Query('code') code: string) {
    return this.shipmentsService.checkCode(code);
  }
}
