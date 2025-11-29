import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/config/query-client';
import type { Income, CreateIncomeDto, UpdateIncomeDto, IncomeFilters } from '@/types';
import { toast } from 'sonner';

export function useIncome(filters?: IncomeFilters) {
    return useQuery({
        queryKey: QUERY_KEYS.INCOME.LIST(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.startDate) params.append('startDate', filters.startDate);
            if (filters?.endDate) params.append('endDate', filters.endDate);
            if (filters?.categoryId) params.append('categoryId', filters.categoryId);
            if (filters?.search) params.append('search', filters.search);

            const url = `${API_ENDPOINTS.INCOME.BASE}?${params.toString()}`;
            return apiClient.get<Income[]>(url);
        },
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
