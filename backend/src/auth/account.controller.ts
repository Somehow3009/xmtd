import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SetDistributorDto } from './dto/set-distributor.dto';
import { JwtAuthGuard } from './jwt.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('account')
export class AccountController {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req: any) {
    const u = req.user?.username;
    const user = await this.users.findOne({
      where: { username: u },
      relations: ['distributors', 'customer'],
    });
    return {
      id: user?.id,
      username: user?.username,
      role: user?.role,
      distributor: user?.distributor,
      fullName: user?.fullName,
      distributors: user?.distributors?.map((d) => d.name) || [],
      customerId: user?.customer?.id,
      customerName: user?.customer?.name,
      creditLimit: user?.customer?.creditLimit,
      creditUsed: user?.customer?.creditUsed,
    };
  }

  @Post('distributor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DVKH')
  async setDistributor(@Req() req: any, @Body() body: SetDistributorDto) {
    const username = req.user?.username;
    const user = await this.users.findOne({
      where: { username },
      relations: ['distributors'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    const allowed = user.distributors?.find((d) => d.name === body.distributor);
    if (!allowed) {
      throw new Error('Distributor not allowed');
    }
    user.distributor = allowed.name;
    await this.users.save(user);
    return { distributor: allowed.name };
  }
}
