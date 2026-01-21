import { Currency } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  MinLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ExpenseFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: 'uuid-here',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Minimum amount',
    example: 10.0,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum amount',
    example: 1000.0,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601)',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO 8601)',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by payment method',
    example: 'credit_card',
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'],
  })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags (comma-separated)',
    example: 'food,restaurant',
  })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiPropertyOptional({
    description: 'Search in description and notes (minimum 2 characters)',
    example: 'lunch',
    minLength: 2,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Search query must be at least 2 characters long' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by currency',
    example: 'USD',
  })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  /**
   * Get tags as array
   */
  getTagsArray(): string[] | undefined {
    return this.tags
      ? this.tags.split(',').map((tag) => tag.trim())
      : undefined;
  }
}

/**
 * Query DTO supporting both offset and cursor-based pagination
 * Use cursor for infinite scroll, page/limit for traditional pagination
 */
export class ExpenseQueryDto extends PaginationQueryDto {
  // Cursor pagination (alternative to page/limit)
  @ApiPropertyOptional({
    description: 'Cursor for pagination (use instead of page)',
    example: 'clh1234567890',
  })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'expenseDate',
    enum: ['expenseDate', 'amount', 'createdAt', 'updatedAt'],
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'expenseDate';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: string = 'desc';

  // Filters
  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({ type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxAmount?: number;

  @ApiPropertyOptional({ type: String })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ type: String })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiPropertyOptional({
    type: String,
    minLength: 2,
    description: 'Search query (minimum 2 characters)',
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Search query must be at least 2 characters long' })
  search?: string;

  @ApiPropertyOptional({ type: String })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  getTagsArray(): string[] | undefined {
    return this.tags
      ? this.tags.split(',').map((tag) => tag.trim())
      : undefined;
  }

  // Set default limit to 50 for cursor pagination
  @ApiPropertyOptional({
    description: 'Number of items (default 50 for cursor, 20 for offset)',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number = 50;
}
