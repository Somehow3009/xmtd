import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  invoiceNo?: string;

  @IsString()
  customer!: string;

  @IsInt()
  @Min(0)
  amount!: number;

  @IsString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  status?: 'unpaid' | 'paid' | 'overdue';
}
