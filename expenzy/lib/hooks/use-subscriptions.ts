import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/config/query-client';
import type { Subscription, CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionSummary } from '@/types';
import { toast } from 'sonner';

export function useSubscriptions() {
    return useQuery({
        queryKey: QUERY_KEYS.SUBSCRIPTIONS.LIST,
        queryFn: () => apiClient.get<Subscription[]>(API_ENDPOINTS.SUBSCRIPTIONS.BASE),
    });
}

export function useSubscription(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.SUBSCRIPTIONS.DETAIL(id),
        queryFn: () => apiClient.get<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id)),
        enabled: !!id,
    });
}

export function useSubscriptionSummary() {
    return useQuery({
        queryKey: QUERY_KEYS.SUBSCRIPTIONS.SUMMARY,
        queryFn: () => apiClient.get<SubscriptionSummary>(API_ENDPOINTS.SUBSCRIPTIONS.SUMMARY),
    });
}

export function useUpcomingSubscriptions() {
    return useQuery({
        queryKey: QUERY_KEYS.SUBSCRIPTIONS.UPCOMING,
        queryFn: () => apiClient.get<Subscription[]>(API_ENDPOINTS.SUBSCRIPTIONS.UPCOMING),
    });
}

export function useCreateSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSubscriptionDto) =>
            apiClient.post<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.BASE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD() });
            toast.success('Subscription created successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to create subscription');
        },
    });
}

export function useUpdateSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionDto }) =>
            apiClient.patch<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id), data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS.DETAIL(variables.id) });
            toast.success('Subscription updated successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to update subscription');
        },
    });
}

export function useDeleteSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            apiClient.delete(API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS.ALL });
            toast.success('Subscription deleted successfully');
        },
        onError: (error: { message: string }) => {
            toast.error(error.message || 'Failed to delete subscription');
        },
    });
}
