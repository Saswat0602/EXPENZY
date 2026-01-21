import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoanAdjustmentDto {
  @IsString()
  @IsIn(['payment', 'increase', 'decrease', 'waive'])
  adjustmentType: 'payment' | 'increase' | 'decrease' | 'waive';

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
