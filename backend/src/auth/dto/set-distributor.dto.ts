import { IsString } from 'class-validator';

export class SetDistributorDto {
  @IsString()
  distributor!: string;
}
