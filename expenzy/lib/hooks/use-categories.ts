import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/config/query-client';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';
import { toast } from 'sonner';

export function useCategories(type?: 'expense' | 'income') {
    return useQuery({
        queryKey: QUERY_KEYS.CATEGORIES.LIST(type),
        queryFn: () => {
            const url = type
                ? `${API_ENDPOINTS.CATEGORIES.BASE}?type=${type}`
                : API_ENDPOINTS.CATEGORIES.BASE;
            return apiClient.get<Category[]>(url);
        },
    });
}

export function useCategory(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.CATEGORIES.DETAIL(id),
        queryFn: () => apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id)),
        enabled: !!id,
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryDto) =>
            apiClient.post<Category>(API_ENDPOINTS.CATEGORIES.BASE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
            toast.success('Category created successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to create category');
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
            apiClient.patch<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id), data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.DETAIL(variables.id) });
            toast.success('Category updated successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to update category');
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            apiClient.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
            toast.success('Category deleted successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to delete category');
        },
    });
}
