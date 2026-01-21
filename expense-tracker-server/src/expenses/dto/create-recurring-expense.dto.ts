import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class CreateRecurringExpenseDto {
  @ApiProperty({ description: 'Category ID for the expense' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Amount of the expense', example: 100.5 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    enum: Currency,
    default: Currency.USD,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({ description: 'Description of the expense' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Payment method used' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Frequency of recurrence',
    enum: RecurringFrequency,
  })
  @IsNotEmpty()
  @IsEnum(RecurringFrequency)
  frequency: RecurringFrequency;

  @ApiProperty({
    description: 'Interval for recurrence (e.g., every 2 weeks)',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  interval?: number;

  @ApiPropertyOptional({
    description: 'Day of week for weekly recurrence (0-6, Sunday=0)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiPropertyOptional({
    description: 'Day of month for monthly recurrence (1-31)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiProperty({ description: 'Start date for recurring pattern' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'End date for recurring pattern' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
