import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
} from 'class-validator';

export class SettleExpenseDto {
  @IsString()
  userId: string; // User who is settling

  @IsNumber()
  @Min(0.01)
  amount: number; // Amount being paid

  @IsOptional()
  @IsEnum(['cash', 'bank_transfer', 'upi', 'card', 'other'])
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionId?: string; // For bank transfers, UPI, etc.

  @IsOptional()
  @IsString()
  proofUrl?: string; // Receipt/proof of payment

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  markAsFullyPaid?: boolean; // If true, mark entire split as paid
}
