import { PaginatedResponseDto } from '../dto/paginated-response.dto';

/**
 * Utility functions for pagination
 */
export class PaginationUtil {
    /**
     * Create a paginated response
     */
    static createPaginatedResponse<T>(
        data: T[],
        total: number,
        page: number,
        limit: number,
    ): PaginatedResponseDto<T> {
        return new PaginatedResponseDto(data, page, limit, total);
    }

    /**
     * Calculate skip value for pagination
     */
    static calculateSkip(page: number, limit: number): number {
        return (page - 1) * limit;
    }

    /**
     * Calculate total pages
     */
    static calculateTotalPages(total: number, limit: number): number {
        return Math.ceil(total / limit);
    }

    /**
     * Validate page number
     */
    static validatePage(page: number, totalPages: number): boolean {
        return page >= 1 && page <= totalPages;
    }
}
