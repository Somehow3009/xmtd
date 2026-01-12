import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Customer) private readonly customers: Repository<Customer>,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.users.findOne({
      where: { username },
      relations: ['distributors', 'customer'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        distributor: user.distributor,
        customerId: user.customer?.id,
        customerName: user.customer?.name,
      },
      process.env.JWT_SECRET || 'change-me',
      { expiresIn: '1h' },
    );
    return {
      accessToken: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        distributor: user.distributor,
        fullName: user.fullName,
        distributors: user.distributors?.map((d) => d.name) || [],
        customerId: user.customer?.id,
        customerName: user.customer?.name,
        creditLimit: user.customer?.creditLimit,
        creditUsed: user.customer?.creditUsed,
      } as any,
    };
  }

  async changePassword(username: string, payload: ChangePasswordDto) {
    const user = await this.users.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }
    const match = await bcrypt.compare(payload.currentPassword, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    user.passwordHash = await bcrypt.hash(payload.newPassword, 8);
    await this.users.save(user);
    return { message: 'Password updated' };
  }
}
