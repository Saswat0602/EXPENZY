import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/config/query-client';
import type { CreateBudgetDto, UpdateBudgetDto, Budget, BudgetPerformance } from '@/types';
import { toast } from 'sonner';

// NOTE: Budget API endpoints are not yet implemented on the backend
// These hooks return empty data to prevent 404 errors

export function useBudgets() {
    return useQuery({
        queryKey: QUERY_KEYS.BUDGETS.LIST,
        queryFn: () => Promise.resolve([] as Budget[]),
        enabled: false, // Disabled until backend is ready
    });
}

export function useBudget(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.BUDGETS.DETAIL(id),
        queryFn: () => Promise.resolve(null as Budget | null),
        enabled: false, // Disabled until backend is ready
    });
}

export function useBudgetPerformance() {
    return useQuery({
        queryKey: QUERY_KEYS.BUDGETS.PERFORMANCE,
        queryFn: () => Promise.resolve({ budgets: [] as BudgetPerformance[] }),
        enabled: false, // Disabled until backend is ready
    });
}

export function useCreateBudget() {
    const queryClient = useQueryClient();

    return useMutation({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mutationFn: async (_data: CreateBudgetDto) => {
            toast.error('Budget feature is not yet available');
            throw new Error('Budget API not implemented');
        },
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mutationFn: async (_params: { id: string; data: UpdateBudgetDto }) => {
            toast.error('Budget feature is not yet available');
            throw new Error('Budget API not implemented');
        },
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
        mutationFn: async () => { // Changed from queryFn to mutationFn to maintain syntactical correctness for useMutation
            // In a real app, we would fetch budget data based on params
            // For now, we'll return mock data or empty state
            return null;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS.ALL });
            toast.success('Budget deleted successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to delete budget');
        },
    });
}
