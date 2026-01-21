import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }

  get take(): number {
    return this.limit ?? 20;
  }
}

/**
 * Cursor-based pagination DTO for infinite scroll
 * More efficient than offset pagination for large datasets
 */
export class CursorPaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Cursor for pagination (ID of last item from previous page)',
    example: 'clh1234567890',
  })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of items to fetch',
    minimum: 1,
    maximum: 100,
    default: 50,
    example: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 50;
}
