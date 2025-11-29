import { SortOrder } from '../dto/sort-query.dto';

/**
 * Utility class for building Prisma queries with pagination, sorting, and filtering
 */
export class QueryBuilder {
    /**
     * Build Prisma orderBy clause from sort parameters
     */
    static buildOrderBy(
        sortFields: Array<{ field: string; order: SortOrder }>,
        allowedFields: string[],
    ): Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>> {
        if (!sortFields || sortFields.length === 0) {
            return {};
        }

        // Filter out invalid fields
        const validSorts = sortFields.filter((sort) =>
            allowedFields.includes(sort.field),
        );

        if (validSorts.length === 0) {
            return {};
        }

        // Single field sort
        if (validSorts.length === 1) {
            return { [validSorts[0].field]: validSorts[0].order };
        }

        // Multiple field sort
        return validSorts.map((sort) => ({ [sort.field]: sort.order }));
    }

    /**
     * Build date range filter for Prisma where clause
     */
    static buildDateRangeFilter(
        startDate?: string | Date,
        endDate?: string | Date,
    ): { gte?: Date; lte?: Date } | undefined {
        if (!startDate && !endDate) {
            return undefined;
        }

        const filter: { gte?: Date; lte?: Date } = {};

        if (startDate) {
            filter.gte = startDate instanceof Date ? startDate : new Date(startDate);
        }

        if (endDate) {
            filter.lte = endDate instanceof Date ? endDate : new Date(endDate);
        }

        return filter;
    }

    /**
     * Build number range filter for Prisma where clause
     */
    static buildNumberRangeFilter(
        min?: number,
        max?: number,
    ): { gte?: number; lte?: number } | undefined {
        if (min === undefined && max === undefined) {
            return undefined;
        }

        const filter: { gte?: number; lte?: number } = {};

        if (min !== undefined) {
            filter.gte = min;
        }

        if (max !== undefined) {
            filter.lte = max;
        }

        return filter;
    }

    /**
     * Build text search filter for Prisma where clause
     */
    static buildTextSearchFilter(
        searchTerm?: string,
        fields?: string[],
    ): { OR?: Array<Record<string, { contains: string; mode: 'insensitive' }>> } | undefined {
        if (!searchTerm || !fields || fields.length === 0) {
            return undefined;
        }

        return {
            OR: fields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive' as const,
                },
            })),
        };
    }

    /**
     * Build array contains filter for Prisma where clause
     */
    static buildArrayContainsFilter(
        values?: string[],
    ): { hasSome?: string[] } | undefined {
        if (!values || values.length === 0) {
            return undefined;
        }

        return {
            hasSome: values,
        };
    }
}
