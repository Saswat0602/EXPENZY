import {
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ParticipantSplitDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number; // For exact splits

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number; // For percentage splits

  @IsOptional()
  @IsNumber()
  @Min(0)
  shares?: number; // For shares-based splits (can be fractional like 1.5)
}

export class CreateGroupExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  paidByUserId: string;

  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @IsEnum(['equal', 'exact', 'percentage', 'shares'])
  splitType: 'equal' | 'exact' | 'percentage' | 'shares';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantSplitDto)
  participants: ParticipantSplitDto[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  expenseDate?: string; // ISO date string

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
