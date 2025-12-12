import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class RecordSettlementDto {
  @IsString()
  fromUserId: string;

  @IsString()
  toUserId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @IsOptional()
  @IsString()
  notes?: string;
}
