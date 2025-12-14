
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/config/query-client';
import type { Expense, CreateExpenseDto, UpdateExpenseDto, ExpenseFilters } from '@/types/expense';
import { toast } from 'sonner';

interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

interface CursorResponse<T> {
    data: T[];
    meta: {
        nextCursor: string | null;
        hasMore: boolean;
        limit: number;
    };
}



export function useExpenses(
    filters?: ExpenseFilters & { page?: number; limit?: number },
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: ['expenses', filters],
        queryFn: async ({ pageParam }) => {
            const params = new URLSearchParams();

            // Handle pagination
            const page = filters?.page || pageParam || 1;
            const limit = filters?.limit || 10;

            params.append('page', page.toString());
            params.append('limit', limit.toString());

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && key !== 'page' && key !== 'limit') {
                        params.append(key, value.toString());
                    }
                });
            }

            const url = `${API_ENDPOINTS.EXPENSES.BASE}?${params.toString()}`;

            // Use getRaw to get the full PaginatedResponse structure directly
            // The backend returns { data: [...], meta: {...} } which matches PaginatedResponse
            const response = await apiClient.getRaw<PaginatedResponse<Expense>>(url);

            return response;
        },
        enabled: options?.enabled,
    });
}

export function useExpense(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.EXPENSES.DETAIL(id),
        queryFn: () => apiClient.get<Expense>(API_ENDPOINTS.EXPENSES.BY_ID(id)),
        enabled: !!id,
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateExpenseDto) =>
            apiClient.post<Expense>(API_ENDPOINTS.EXPENSES.BASE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD() });
            toast.success('Expense created successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to create expense');
        },
    });
}

export function useUpdateExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateExpenseDto }) =>
            apiClient.patch<Expense>(API_ENDPOINTS.EXPENSES.BY_ID(id), data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.DETAIL(variables.id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD() });
            toast.success('Expense updated successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to update expense');
        },
    });
}

export function useDeleteExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            apiClient.delete(API_ENDPOINTS.EXPENSES.BY_ID(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD() });
            toast.success('Expense deleted successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to delete expense');
        },
    });
}

/**
 * Cursor-based infinite query for expenses
 * Uses cursor pagination with 50 items per page
 * Minimum 2 characters required for search
 */
export function useInfiniteExpenses(filters?: ExpenseFilters) {
    return useInfiniteQuery({
        queryKey: ['expenses', 'infinite', filters],
        queryFn: async ({ pageParam }) => {
            const params = new URLSearchParams();

            // Add cursor if available
            if (pageParam) {
                params.append('cursor', pageParam);
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
            if (filters?.minAmount !== undefined) {
                params.append('minAmount', filters.minAmount.toString());
            }
            if (filters?.maxAmount !== undefined) {
                params.append('maxAmount', filters.maxAmount.toString());
            }
            if (filters?.sortBy) {
                params.append('sortBy', filters.sortBy);
            }
            if (filters?.sortOrder) {
                params.append('sortOrder', filters.sortOrder);
            }

            const url = `${API_ENDPOINTS.EXPENSES.BASE}?${params.toString()}`;
            const response = await apiClient.get<CursorResponse<Expense>>(url);

            return response;
        },
        getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
        initialPageParam: undefined as string | undefined,
        staleTime: 1000 * 60, // 1 minute
    });
}
