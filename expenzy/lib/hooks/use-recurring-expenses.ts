'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../api/endpoints';
import { apiClient } from '../api/client';

export interface RecurringExpense {
    id: string;
    userId: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
    startDate: string;
    endDate?: string;
    nextOccurrence: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRecurringExpenseInput {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
    startDate: string;
    endDate?: string;
}

export function useRecurringExpenses() {
    return useQuery({
        queryKey: ['recurring-expenses'],
        queryFn: async () => {
            return await apiClient.get<RecurringExpense[]>(
                API_ENDPOINTS.RECURRING_EXPENSES.BASE
            );
        },
    });
}

export function useRecurringExpense(id: string) {
    return useQuery({
        queryKey: ['recurring-expense', id],
        queryFn: async () => {
            return await apiClient.get<RecurringExpense>(
                API_ENDPOINTS.RECURRING_EXPENSES.BY_ID(id)
            );
        },
        enabled: !!id,
    });
}

export function useCreateRecurringExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateRecurringExpenseInput) => {
            return await apiClient.post<RecurringExpense>(
                API_ENDPOINTS.RECURRING_EXPENSES.BASE,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
        },
    });
}

export function useUpdateRecurringExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string;
            data: Partial<CreateRecurringExpenseInput>;
        }) => {
            return await apiClient.patch<RecurringExpense>(
                API_ENDPOINTS.RECURRING_EXPENSES.BY_ID(id),
                data
            );
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
            queryClient.invalidateQueries({
                queryKey: ['recurring-expense', variables.id],
            });
        },
    });
}

export function useDeleteRecurringExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(API_ENDPOINTS.RECURRING_EXPENSES.BY_ID(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
        },
    });
}
