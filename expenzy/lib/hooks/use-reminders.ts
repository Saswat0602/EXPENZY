'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../api/endpoints';
import { apiClient } from '../api/client';

export interface Reminder {
    id: string;
    userId: string;
    type: 'payment' | 'subscription' | 'loan' | 'custom';
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    reminderDate: string;
    actionUrl?: string;
    actionLabel?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

export interface CreateReminderInput {
    type: 'payment' | 'subscription' | 'loan' | 'custom';
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    reminderDate: string;
    actionUrl?: string;
    actionLabel?: string;
}

export function useReminders() {
    return useQuery({
        queryKey: ['reminders'],
        queryFn: async () => {
            return await apiClient.get<Reminder[]>(
                API_ENDPOINTS.REMINDERS.BASE
            );
        },
    });
}

export function useReminder(id: string) {
    return useQuery({
        queryKey: ['reminder', id],
        queryFn: async () => {
            return await apiClient.get<Reminder>(
                API_ENDPOINTS.REMINDERS.BY_ID(id)
            );
        },
        enabled: !!id,
    });
}

export function useCreateReminder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateReminderInput) => {
            return await apiClient.post<Reminder>(
                API_ENDPOINTS.REMINDERS.BASE,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
}

export function useMarkReminderAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return await apiClient.patch<Reminder>(
                API_ENDPOINTS.REMINDERS.MARK_READ(id)
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
}

export function useDeleteReminder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(API_ENDPOINTS.REMINDERS.BY_ID(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
}
