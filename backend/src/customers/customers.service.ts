import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Customer } from '../entities/customer.entity';
import { User } from '../entities/user.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private readonly customers: Repository<Customer>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  list() {
    return this.customers.find();
  }

  listAccounts() {
    return this.users.find({ where: { role: 'NPP' }, relations: ['customer'] });
  }

  async create(dto: CreateCustomerDto) {
    const customer = this.customers.create({
      ...dto,
      creditUsed: 0,
    });
    const saved = await this.customers.save(customer);
    return saved;
  }

  async createAccount(customerId: number, username: string, password: string) {
    const customer = await this.customers.findOne({ where: { id: customerId } });
    if (!customer) throw new Error('Customer not found');
    const existing = await this.users.findOne({ where: { username } });
    if (existing) throw new Error('Username taken');
    const user = this.users.create({
      username,
      passwordHash: await bcrypt.hash(password, 8),
      role: 'NPP',
      fullName: customer.name,
      distributor: customer.name,
      customer,
    });
    return this.users.save(user);
  }

  async resetPassword(username: string, newPassword: string) {
    const user = await this.users.findOne({ where: { username } });
    if (!user) throw new Error('User not found');
    user.passwordHash = await bcrypt.hash(newPassword, 8);
    return this.users.save(user);
  }
}
