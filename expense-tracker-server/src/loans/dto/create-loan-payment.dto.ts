import {
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';

export class CreateLoanPaymentDto {
  @IsDecimal()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
