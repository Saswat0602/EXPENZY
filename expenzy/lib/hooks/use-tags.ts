import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export interface Tag {
    id: string;
    userId: string;
    name: string;
    color?: string;
    createdAt: string;
    _count?: {
        expenses: number;
    };
}

export interface CreateTagData {
    name: string;
    color?: string;
}

// Get all tags
export function useTags() {
    return useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            return await apiClient.get<Tag[]>(API_ENDPOINTS.TAGS.LIST);
        },
    });
}

// Create tag
export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateTagData) => {
            return await apiClient.post<Tag>(API_ENDPOINTS.TAGS.LIST, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            toast.success('Tag created successfully');
        },
        onError: () => {
            toast.error('Failed to create tag');
        },
    });
}

// Update tag
export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: CreateTagData }) => {
            return await apiClient.patch<Tag>(
                `${API_ENDPOINTS.TAGS.LIST}/${id}`,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            toast.success('Tag updated successfully');
        },
        onError: () => {
            toast.error('Failed to update tag');
        },
    });
}

// Delete tag
export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`${API_ENDPOINTS.TAGS.LIST}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            toast.success('Tag deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete tag');
        },
    });
}
