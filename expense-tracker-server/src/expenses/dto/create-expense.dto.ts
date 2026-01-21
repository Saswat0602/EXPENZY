import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Currency } from '@prisma/client';

export class CreateExpenseDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  expenseDate: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  locationLat?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  locationLng?: number;

  @IsString()
  @IsOptional()
  locationName?: string;
}
