import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateShipmentDto {
  @IsNumber()
  orderId!: number;

  @IsString()
  pickupLocation!: string;

  @IsString()
  dropoffLocation!: string;

  @IsString()
  vehicle!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
