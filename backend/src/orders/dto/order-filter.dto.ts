import { IsOptional, IsString } from 'class-validator';

export class OrderFilterDto {
  @IsOptional()
  @IsString()
  product?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  locked?: string;

  @IsOptional()
  @IsString()
  expireSoon?: string;
}
