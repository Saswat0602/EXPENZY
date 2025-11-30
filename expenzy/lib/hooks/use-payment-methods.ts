import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export interface PaymentMethod {
    id: string;
    userId: string;
    name: string;
    type: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';
    isDefault: boolean;
    createdAt: string;
    _count?: {
        expenses: number;
    };
}

export interface CreatePaymentMethodData {
    name: string;
    type: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';
    isDefault?: boolean;
}

// Get all payment methods
export function usePaymentMethods() {
    return useQuery({
        queryKey: ['payment-methods'],
        queryFn: async () => {
            return await apiClient.get<PaymentMethod[]>(API_ENDPOINTS.PAYMENT_METHODS.LIST);
        },
    });
}

// Create payment method
export function useCreatePaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreatePaymentMethodData) => {
            return await apiClient.post<PaymentMethod>(
                API_ENDPOINTS.PAYMENT_METHODS.LIST,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
            toast.success('Payment method created successfully');
        },
        onError: () => {
            toast.error('Failed to create payment method');
        },
    });
}

// Update payment method
export function useUpdatePaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePaymentMethodData> }) => {
            return await apiClient.patch<PaymentMethod>(
                `${API_ENDPOINTS.PAYMENT_METHODS.LIST}/${id}`,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
            toast.success('Payment method updated successfully');
        },
        onError: () => {
            toast.error('Failed to update payment method');
        },
    });
}

// Delete payment method
export function useDeletePaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`${API_ENDPOINTS.PAYMENT_METHODS.LIST}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
            toast.success('Payment method deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete payment method');
        },
    });
}
