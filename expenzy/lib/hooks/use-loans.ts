import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import type {
    Loan,
    ConsolidatedLoans,
    LoanStatistics,
    TransactionHistory,
    CreateLoanRequest,
    LoanAdjustmentRequest,
    CreateLoanFromGroupRequest,
    LoanQueryParams,
    LoanAdjustment,
} from '@/types/loan';

// Get consolidated loans (direct + group loans + statistics)
export function useConsolidatedLoans() {
    return useQuery({
        queryKey: ['loans', 'consolidated'],
        queryFn: async () => {
            const response = await apiClient.get<ConsolidatedLoans>(
                API_ENDPOINTS.LOANS.CONSOLIDATED
            );
            return response;
        },
    });
}

// Get all loans with filters
export function useLoans(params?: LoanQueryParams) {
    const queryString = params
        ? '?' + new URLSearchParams(params as Record<string, string>).toString()
        : '';

    return useQuery({
        queryKey: ['loans', 'list', params],
        queryFn: async () => {
            const response = await apiClient.get<Loan[]>(
                `${API_ENDPOINTS.LOANS.LIST}${queryString}`
            );
            return response;
        },
    });
}

// Get single loan by ID
export function useLoan(id: string) {
    return useQuery({
        queryKey: ['loans', id],
        queryFn: async () => {
            const response = await apiClient.get<Loan>(API_ENDPOINTS.LOANS.BY_ID(id));
            return response;
        },
        enabled: !!id,
    });
}

// Get loan statistics
export function useLoanStatistics() {
    return useQuery({
        queryKey: ['loans', 'statistics'],
        queryFn: async () => {
            const response = await apiClient.get<LoanStatistics>(
                API_ENDPOINTS.LOANS.STATISTICS
            );
            return response;
        },
    });
}

// Get transaction history with another user
export function useTransactionHistory(otherUserId: string) {
    return useQuery({
        queryKey: ['loans', 'transactions', otherUserId],
        queryFn: async () => {
            const response = await apiClient.get<TransactionHistory>(
                API_ENDPOINTS.LOANS.TRANSACTIONS(otherUserId)
            );
            return response;
        },
        enabled: !!otherUserId,
    });
}

// Get loan adjustments
export function useLoanAdjustments(loanId: string) {
    return useQuery({
        queryKey: ['loans', loanId, 'adjustments'],
        queryFn: async () => {
            const response = await apiClient.get<LoanAdjustment[]>(
                API_ENDPOINTS.LOANS.ADJUSTMENTS(loanId)
            );
            return response;
        },
        enabled: !!loanId,
    });
}

// Create loan
export function useCreateLoan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateLoanRequest) => {
            const response = await apiClient.post<Loan>(API_ENDPOINTS.LOANS.LIST, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            toast.success('Loan created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create loan');
        },
    });
}

// Create loan from group balance
export function useCreateLoanFromGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateLoanFromGroupRequest) => {
            const response = await apiClient.post<Loan>(
                API_ENDPOINTS.LOANS.FROM_GROUP,
                data
            );
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('Loan created from group balance');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create loan from group');
        },
    });
}

// Add loan adjustment (payment, increase, decrease, waive)
export function useAddLoanAdjustment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            loanId,
            data,
        }: {
            loanId: string;
            data: LoanAdjustmentRequest;
        }) => {
            const response = await apiClient.post(
                API_ENDPOINTS.LOANS.ADJUSTMENTS(loanId),
                data
            );
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            queryClient.invalidateQueries({ queryKey: ['loans', variables.loanId] });
            queryClient.invalidateQueries({
                queryKey: ['loans', variables.loanId, 'adjustments'],
            });

            const adjustmentType = variables.data.adjustmentType;
            const messages = {
                payment: 'Payment recorded successfully',
                increase: 'Loan amount increased',
                decrease: 'Loan amount decreased',
                waive: 'Loan waived successfully',
            };
            toast.success(messages[adjustmentType] || 'Adjustment recorded');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to record adjustment');
        },
    });
}

// Update loan
export function useUpdateLoan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string;
            data: Partial<CreateLoanRequest>;
        }) => {
            const response = await apiClient.patch<Loan>(
                API_ENDPOINTS.LOANS.BY_ID(id),
                data
            );
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            toast.success('Loan updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update loan');
        },
    });
}

// Delete loan
export function useDeleteLoan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(API_ENDPOINTS.LOANS.BY_ID(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            toast.success('Loan deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete loan');
        },
    });
}

// Legacy hooks for backward compatibility
export function useLentLoans() {
    return useLoans({ role: 'lender' });
}

export function useBorrowedLoans() {
    return useLoans({ role: 'borrower' });
}

export function useAddLoanPayment() {
    const addAdjustment = useAddLoanAdjustment();

    return {
        ...addAdjustment,
        mutateAsync: async ({
            loanId,
            data,
        }: {
            loanId: string;
            data: { amount: number; note?: string };
        }) => {
            return addAdjustment.mutateAsync({
                loanId,
                data: {
                    adjustmentType: 'payment',
                    amount: data.amount,
                    notes: data.note,
                    paymentDate: new Date().toISOString(),
                },
            });
        },
    };
}
