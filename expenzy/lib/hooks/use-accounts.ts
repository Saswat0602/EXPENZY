import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export interface Account {
    id: string;
    userId: string;
    name: string;
    type: 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'OTHER';
    balance: number;
    currency: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAccountData {
    name: string;
    type: 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'OTHER';
    balance?: number;
    currency?: string;
    isDefault?: boolean;
}

// Get all accounts
export function useAccounts() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            return await apiClient.get<Account[]>(API_ENDPOINTS.ACCOUNTS.LIST);
        },
    });
}

// Get single account
export function useAccount(id: string) {
    return useQuery({
        queryKey: ['accounts', id],
        queryFn: async () => {
            return await apiClient.get<Account>(
                `${API_ENDPOINTS.ACCOUNTS.LIST}/${id}`
            );
        },
        enabled: !!id,
    });
}

// Get total balance across all accounts
export function useTotalBalance() {
    return useQuery({
        queryKey: ['accounts', 'total-balance'],
        queryFn: async () => {
            return await apiClient.get<{ totalBalance: number }>(
                `${API_ENDPOINTS.ACCOUNTS.LIST}/total-balance`
            );
        },
    });
}

// Create account
export function useCreateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateAccountData) => {
            return await apiClient.post<Account>(
                API_ENDPOINTS.ACCOUNTS.LIST,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success('Account created successfully');
        },
        onError: () => {
            toast.error('Failed to create account');
        },
    });
}

// Update account
export function useUpdateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAccountData> }) => {
            return await apiClient.patch<Account>(
                `${API_ENDPOINTS.ACCOUNTS.LIST}/${id}`,
                data
            );
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['accounts', variables.id] });
            toast.success('Account updated successfully');
        },
        onError: () => {
            toast.error('Failed to update account');
        },
    });
}

// Delete account
export function useDeleteAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`${API_ENDPOINTS.ACCOUNTS.LIST}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success('Account deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete account');
        },
    });
}
