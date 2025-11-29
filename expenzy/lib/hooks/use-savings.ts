import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/config/query-client';
import type { SavingsGoal, CreateSavingsGoalDto, UpdateSavingsGoalDto, AddContributionDto, SavingsGoalProgress } from '@/types';
import { toast } from 'sonner';

export function useSavingsGoals() {
    return useQuery({
        queryKey: QUERY_KEYS.SAVINGS.LIST,
        queryFn: () => apiClient.get<SavingsGoal[]>(API_ENDPOINTS.SAVINGS_GOALS.BASE),
    });
}

export function useSavingsGoal(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.SAVINGS.DETAIL(id),
        queryFn: () => apiClient.get<SavingsGoal>(API_ENDPOINTS.SAVINGS_GOALS.BY_ID(id)),
        enabled: !!id,
    });
}

export function useSavingsProgress() {
    return useQuery({
        queryKey: QUERY_KEYS.SAVINGS.PROGRESS,
        queryFn: () => apiClient.get<{ goals: SavingsGoalProgress[] }>(API_ENDPOINTS.SAVINGS_GOALS.PROGRESS),
    });
}

export function useCreateSavingsGoal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSavingsGoalDto) =>
            apiClient.post<SavingsGoal>(API_ENDPOINTS.SAVINGS_GOALS.BASE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVINGS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD() });
            toast.success('Savings goal created successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to create savings goal');
        },
    });
}

export function useUpdateSavingsGoal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSavingsGoalDto }) =>
            apiClient.patch<SavingsGoal>(API_ENDPOINTS.SAVINGS_GOALS.BY_ID(id), data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVINGS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVINGS.DETAIL(variables.id) });
            toast.success('Savings goal updated successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to update savings goal');
        },
    });
}

export function useDeleteSavingsGoal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            apiClient.delete(API_ENDPOINTS.SAVINGS_GOALS.BY_ID(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVINGS.ALL });
            toast.success('Savings goal deleted successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to delete savings goal');
        },
    });
}

export function useAddContribution() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: AddContributionDto }) =>
            apiClient.post(API_ENDPOINTS.SAVINGS_GOALS.CONTRIBUTE(id), data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVINGS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVINGS.DETAIL(variables.id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD() });
            toast.success('Contribution added successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to add contribution');
        },
    });
}
