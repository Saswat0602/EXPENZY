import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/config/query-client';
import type { Income, CreateIncomeDto, UpdateIncomeDto, IncomeFilters } from '@/types';
import { toast } from 'sonner';

export function useIncome(filters?: IncomeFilters, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: QUERY_KEYS.INCOME.LIST(filters as Record<string, unknown> | undefined),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.startDate) params.append('startDate', filters.startDate);
            if (filters?.endDate) params.append('endDate', filters.endDate);
            if (filters?.categoryId) params.append('categoryId', filters.categoryId);
            if (filters?.search) params.append('search', filters.search);

            const url = `${API_ENDPOINTS.INCOME.BASE}?${params.toString()}`;
            return apiClient.get<Income[]>(url);
        },
        enabled: options?.enabled,
    });
}

export function useCreateIncome() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateIncomeDto) =>
            apiClient.post<Income>(API_ENDPOINTS.INCOME.BASE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INCOME.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD() });
            toast.success('Income created successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to create income');
        },
    });
}

export function useUpdateIncome() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateIncomeDto }) =>
            apiClient.patch<Income>(API_ENDPOINTS.INCOME.BY_ID(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INCOME.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD() });
            toast.success('Income updated successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to update income');
        },
    });
}

export function useDeleteIncome() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            apiClient.delete(API_ENDPOINTS.INCOME.BY_ID(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INCOME.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD() });
            toast.success('Income deleted successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to delete income');
        },
    });
}

interface CursorResponse<T> {
    data: T[];
    meta: {
        nextCursor: string | null;
        hasMore: boolean;
        limit: number;
    };
}

interface OffsetResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

/**
 * Cursor-based infinite query for income
 * Uses cursor pagination with 50 items per page
 * Minimum 2 characters required for search
 */
export function useInfiniteIncome(filters?: IncomeFilters) {
    return useInfiniteQuery({
        queryKey: ['income', 'infinite', filters],
        queryFn: async ({ pageParam }) => {
            const params = new URLSearchParams();

            // Add page if available (offset pagination)
            if (pageParam) {
                params.append('page', pageParam.toString());
            }

            // Set limit to 50
            params.append('limit', '50');

            // Only add search if >= 2 chars
            if (filters?.search && filters.search.trim().length >= 2) {
                params.append('search', filters.search.trim());
            }

            // Add other filters
            if (filters?.categoryId) {
                params.append('categoryId', filters.categoryId);
            }
            if (filters?.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters?.endDate) {
                params.append('endDate', filters.endDate);
            }

            const url = `${API_ENDPOINTS.INCOME.BASE}?${params.toString()}`;
            const response = await apiClient.getRaw<{ data: OffsetResponse<Income> }>(url);
            const actualData = response.data;

            // Convert offset response to cursor format for consistency
            const hasMore = actualData.data.length === actualData.limit &&
                (actualData.page * actualData.limit) < actualData.total;

            return {
                data: actualData.data,
                meta: {
                    nextCursor: hasMore ? (actualData.page + 1).toString() : null,
                    hasMore,
                    limit: actualData.limit,
                },
            };
        },
        getNextPageParam: (lastPage) => {
            const nextCursor = lastPage?.meta?.nextCursor;
            return nextCursor ? parseInt(nextCursor, 10) : null;
        },
        initialPageParam: 1 as number,
        staleTime: 1000 * 60, // 1 minute
    });
}
