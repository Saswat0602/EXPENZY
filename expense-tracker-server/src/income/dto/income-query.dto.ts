import { IsOptional, IsString, IsDateString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/**
 * Query DTO supporting both offset and cursor-based pagination for income
 * Use cursor for infinite scroll, page/limit for traditional pagination
 */
export class IncomeQueryDto extends PaginationQueryDto {
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
    example: 'incomeDate',
    enum: ['incomeDate', 'amount', 'createdAt', 'updatedAt'],
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'incomeDate';

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

  @ApiPropertyOptional({ type: String })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ type: String })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    type: String,
    minLength: 2,
    description: 'Search query (minimum 2 characters)',
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Search query must be at least 2 characters long' })
  search?: string;
}
