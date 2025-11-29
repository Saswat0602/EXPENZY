import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/config/query-client';
import type { Budget, CreateBudgetDto, UpdateBudgetDto, BudgetPerformance } from '@/types';
import { toast } from 'sonner';

export function useBudgets() {
    return useQuery({
        queryKey: QUERY_KEYS.BUDGETS.LIST,
        queryFn: () => apiClient.get<Budget[]>(API_ENDPOINTS.BUDGETS.BASE),
    });
}

export function useBudget(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.BUDGETS.DETAIL(id),
        queryFn: () => apiClient.get<Budget>(API_ENDPOINTS.BUDGETS.BY_ID(id)),
        enabled: !!id,
    });
}

export function useBudgetPerformance() {
    return useQuery({
        queryKey: QUERY_KEYS.BUDGETS.PERFORMANCE,
        queryFn: () => apiClient.get<{ budgets: BudgetPerformance[] }>(API_ENDPOINTS.BUDGETS.PERFORMANCE),
    });
}

export function useCreateBudget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBudgetDto) =>
            apiClient.post<Budget>(API_ENDPOINTS.BUDGETS.BASE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS.ALL });
            toast.success('Budget created successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to create budget');
        },
    });
}

export function useUpdateBudget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBudgetDto }) =>
            apiClient.patch<Budget>(API_ENDPOINTS.BUDGETS.BY_ID(id), data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS.DETAIL(variables.id) });
            toast.success('Budget updated successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to update budget');
        },
    });
}

export function useDeleteBudget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            apiClient.delete(API_ENDPOINTS.BUDGETS.BY_ID(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS.ALL });
            toast.success('Budget deleted successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to delete budget');
        },
    });
}
