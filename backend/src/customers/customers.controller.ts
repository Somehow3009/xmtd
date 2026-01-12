import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DVKH')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list() {
    return this.customersService.list();
  }

  @Get('accounts')
  listAccounts() {
    return this.customersService.listAccounts();
  }

  @Post()
  create(@Body() body: CreateCustomerDto) {
    return this.customersService.create(body);
  }

  @Post(':id/account')
  createAccount(@Param('id') id: string, @Body() body: { username: string; password: string }) {
    return this.customersService.createAccount(Number(id), body.username, body.password);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { username: string; password: string }) {
    return this.customersService.resetPassword(body.username, body.password);
  }
}
