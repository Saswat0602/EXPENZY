export interface Loan {
    id: string;
    userId: string;
    lenderId?: string;
    borrowerId?: string;
    amount: number;
    currency: string;
    description: string;
    loanDate: string;
    dueDate?: string;
    status: 'pending' | 'partial' | 'settled';
    amountPaid: number;
    interestRate?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    lender?: {
        id: string;
        name: string;
        email: string;
    };
    borrower?: {
        id: string;
        name: string;
        email: string;
    };
    payments?: LoanPayment[];
}

export interface LoanPayment {
    id: string;
    loanId: string;
    amount: number;
    paymentDate: string;
    notes?: string;
    createdAt: string;
}

export interface CreateLoanDto {
    lenderId?: string;
    borrowerId?: string;
    amount: number;
    currency?: string;
    description: string;
    loanDate: string;
    dueDate?: string;
    interestRate?: number;
    notes?: string;
}

export interface UpdateLoanDto extends Partial<CreateLoanDto> {
    status?: 'pending' | 'partial' | 'settled';
}

export interface AddLoanPaymentDto {
    amount: number;
    paymentDate: string;
    notes?: string;
}

export interface LoanSummary {
    totalLent: number;
    totalBorrowed: number;
    totalLentOutstanding: number;
    totalBorrowedOutstanding: number;
    netPosition: number;
}
