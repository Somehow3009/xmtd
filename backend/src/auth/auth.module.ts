import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountController } from './account.controller';
import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Customer])],
  providers: [AuthService],
  controllers: [AuthController, AccountController],
})
export class AuthModule {}
