import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoanFromGroupDto {
  @IsUUID()
  groupId: string;

  @IsUUID()
  borrowerUserId: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
