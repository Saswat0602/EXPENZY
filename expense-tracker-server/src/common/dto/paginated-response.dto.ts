import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
    @ApiProperty({ description: 'Current page number', example: 1 })
    page: number;

    @ApiProperty({ description: 'Number of items per page', example: 20 })
    limit: number;

    @ApiProperty({ description: 'Total number of items', example: 150 })
    total: number;

    @ApiProperty({ description: 'Total number of pages', example: 8 })
    totalPages: number;

    @ApiProperty({ description: 'Whether there is a next page', example: true })
    hasNext: boolean;

    @ApiProperty({
        description: 'Whether there is a previous page',
        example: false,
    })
    hasPrevious: boolean;

    constructor(page: number, limit: number, total: number) {
        this.page = page;
        this.limit = limit;
        this.total = total;
        this.totalPages = Math.ceil(total / limit);
        this.hasNext = page < this.totalPages;
        this.hasPrevious = page > 1;
    }
}

export class PaginatedResponseDto<T> {
    @ApiProperty({ description: 'Array of data items', isArray: true })
    data: T[];

    @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
    meta: PaginationMetaDto;

    constructor(data: T[], page: number, limit: number, total: number) {
        this.data = data;
        this.meta = new PaginationMetaDto(page, limit, total);
    }
}
