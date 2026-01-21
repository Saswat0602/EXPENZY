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

export class ParticipantSplitUpdateDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shares?: number;
}

export class UpdateGroupExpenseDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(['equal', 'exact', 'percentage', 'shares'])
  splitType?: 'equal' | 'exact' | 'percentage' | 'shares';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantSplitUpdateDto)
  participants?: ParticipantSplitUpdateDto[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
