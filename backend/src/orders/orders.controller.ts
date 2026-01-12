import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderFilterDto } from './dto/order-filter.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('DVKH', 'NPP')
  list(@Query() query: OrderFilterDto, @Req() req: any) {
    return this.ordersService.list(query, req.user);
  }

  @Post()
  @Roles('DVKH', 'NPP')
  create(@Body() body: any, @Req() req: any) {
    return this.ordersService.create(body, req.user);
  }

  @Patch(':id/approve')
  @Roles('DVKH')
  approve(@Param('id') id: string, @Body() body: { approve: boolean; approver: string }) {
    return this.ordersService.approve(Number(id), body.approve, body.approver);
  }
}
