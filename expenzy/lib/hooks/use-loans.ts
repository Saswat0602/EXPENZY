import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export interface Loan {
    id: string;
    lenderUserId: string;
    borrowerUserId: string;
    amount: number;
    currency: string;
    description?: string;
    dueDate?: string;
    status: string;
    amountPaid: number;
    amountRemaining: number;
    createdAt: string;
    updatedAt: string;
    lender?: {
        id: string;
        username: string;
        email: string;
    };
    borrower?: {
        id: string;
        username: string;
        email: string;
    };
    payments?: LoanPayment[];
}

export interface LoanPayment {
    id: string;
    loanId: string;
    amount: number;
    paidAt: string;
    note?: string;
}

export interface CreateLoanData {
    borrowerId?: string;
    borrowerEmail?: string;
    borrowerName?: string;
    lenderName?: string;
    amount: number;
    currency?: string;
    description?: string;
    loanDate: string;
    dueDate?: string;
    type?: 'LENT' | 'BORROWED';
}

export interface AddPaymentData {
    amount: number;
    note?: string;
}

// Get all loans
export function useLoans() {
    return useQuery({
        queryKey: ['loans'],
        queryFn: async () => {
            return await apiClient.get<Loan[]>(API_ENDPOINTS.LOANS.LIST);
        },
    });
}

// Get loans I lent (money I gave to others)
export function useLentLoans() {
    return useQuery({
        queryKey: ['loans', 'lent'],
        queryFn: async () => {
            return await apiClient.get<Loan[]>(`${API_ENDPOINTS.LOANS.LIST}?role=lender`);
        },
    });
}

// Get loans I borrowed (money I took from others)
export function useBorrowedLoans() {
    return useQuery({
        queryKey: ['loans', 'borrowed'],
        queryFn: async () => {
            return await apiClient.get<Loan[]>(`${API_ENDPOINTS.LOANS.LIST}?role=borrower`);
        },
    });
}

// Create loan
export function useCreateLoan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateLoanData) => {
            return await apiClient.post<Loan>(API_ENDPOINTS.LOANS.LIST, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            toast.success('Loan created successfully');
        },
        onError: () => {
            toast.error('Failed to create loan');
        },
    });
}

// Update loan
export function useUpdateLoan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CreateLoanData> }) => {
            return await apiClient.patch<Loan>(
                `${API_ENDPOINTS.LOANS.LIST}/${id}`,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            toast.success('Loan updated successfully');
        },
        onError: () => {
            toast.error('Failed to update loan');
        },
    });
}

// Delete loan
export function useDeleteLoan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`${API_ENDPOINTS.LOANS.LIST}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            toast.success('Loan deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete loan');
        },
    });
}

// Add loan payment
export function useAddLoanPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ loanId, data }: { loanId: string; data: AddPaymentData }) => {
            return await apiClient.post(
                `${API_ENDPOINTS.LOANS.LIST}/${loanId}/payments`,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            toast.success('Payment recorded successfully');
        },
        onError: () => {
            toast.error('Failed to record payment');
        },
    });
}
