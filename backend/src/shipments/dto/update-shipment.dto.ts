import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateShipmentDto {
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @IsOptional()
  @IsString()
  vehicle?: string;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'scheduled' | 'delivered';

  @IsOptional()
  @IsString()
  notes?: string;
}
