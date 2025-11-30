import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export interface Notification {
    id: string;
    userId: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    metadata?: Record<string, unknown>;
}

// Get all notifications
export function useNotifications() {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            return await apiClient.get<Notification[]>(
                API_ENDPOINTS.NOTIFICATIONS.LIST
            );
        },
    });
}

// Get unread count
export function useUnreadNotificationsCount() {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async () => {
            const result = await apiClient.get<{ count: number }>(
                `${API_ENDPOINTS.NOTIFICATIONS.LIST}/unread-count`
            );
            return result.count;
        },
    });
}

// Mark notification as read
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

// Mark all as read
export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/read-all`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('All notifications marked as read');
        },
        onError: () => {
            toast.error('Failed to mark notifications as read');
        },
    });
}

// Delete notification
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Notification deleted');
        },
        onError: () => {
            toast.error('Failed to delete notification');
        },
    });
}
