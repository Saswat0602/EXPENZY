import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SortQueryDto {
  @ApiPropertyOptional({
    description: 'Field to sort by. Can be comma-separated for multiple fields',
    example: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description:
      'Sort order (asc or desc). Can be comma-separated for multiple fields',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  sortOrder?: string = SortOrder.DESC;

  /**
   * Parse sort parameters into an array of sort configurations
   * @returns Array of {field, order} objects
   */
  getParsedSort(): Array<{ field: string; order: SortOrder }> {
    if (!this.sortBy) {
      return [];
    }

    const fields = this.sortBy.split(',').map((f) => f.trim());
    const orders = this.sortOrder
      ? this.sortOrder.split(',').map((o) => o.trim() as SortOrder)
      : [];

    return fields.map((field, index) => ({
      field,
      order: orders[index] || SortOrder.DESC,
    }));
  }
}
