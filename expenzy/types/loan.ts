// Loan Types matching backend API
export interface Loan {
    id: string;
    lenderUserId: string;
    borrowerUserId: string;
    amount: string;
    currency: string;
    description: string | null;
    loanDate: string;
    dueDate: string | null;
    status: 'active' | 'paid' | 'waived' | 'cancelled';
    amountPaid: string;
    amountRemaining: string;
    interestRate: string;
    paymentTerms: string | null;
    groupId: string | null;
    sourceType: string;
    sourceId: string | null;
    lastPaymentDate: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    lender: LoanUser;
    borrower: LoanUser;
    group?: LoanGroup | null;
    _count?: {
        adjustments: number;
        payments: number;
    };
}

export interface LoanUser {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    avatarUrl: string | null;
    avatarSeed?: string | null;
    avatarStyle?: string | null;
}

export interface LoanGroup {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
}

export interface LoanAdjustment {
    id: string;
    loanId: string;
    adjustmentType: 'payment' | 'increase' | 'decrease' | 'waive';
    amount: string;
    currency: string;
    reason: string | null;
    notes: string | null;
    paymentMethod: string | null;
    paymentDate: string | null;
    createdBy: string;
    createdAt: string;
    creator: LoanUser;
}

export interface GroupLoan {
    groupId: string;
    groupName: string;
    groupIcon?: string;
    groupColor?: string;
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar?: string;
    amount: number;
    currency: string;
    type: 'owed_to_me' | 'i_owe';
    canConvertToLoan: boolean;
    lastExpenseDate?: string;
}

export interface PersonLoanSummary {
    personId: string;
    personName: string;
    personAvatar?: string | null;
    personAvatarSeed?: string | null;
    personAvatarStyle?: string | null;
    totalAmount: number;
    currency: string;
    loanType: 'lent' | 'borrowed';

    // Breakdown
    directLoanAmount: number;
    groupBalanceAmount: number;
    groupDetails: Array<{
        groupId: string;
        groupName: string;
        amount: number;
    }>;

    // Existing fields
    loanIds: string[];
    lastLoanDate: string;
}

export interface LoanStatistics {
    totalLent: number;
    totalBorrowed: number;
    netPosition: number;
    totalLentOutstanding: number;
    totalBorrowedOutstanding: number;
    activeLoansCount: number;
    groupDebtsCount: number;
}

export interface ConsolidatedLoans {
    directLoans: Loan[];
    groupLoans: GroupLoan[];
    personSummaries: PersonLoanSummary[];
    statistics: LoanStatistics;
}

export interface TransactionHistory {
    loans: Loan[];
    summary: {
        totalLoans: number;
        activeLoans: number;
        paidLoans: number;
        youOwe: number;
        theyOwe: number;
        netBalance: number;
    };
    otherUser: LoanUser | null;
}

// Request Types
export interface CreateLoanRequest {
    lenderUserId: string;
    borrowerUserId: string;
    amount: number;
    currency?: string;
    description?: string;
    loanDate: string;
    dueDate?: string;
    interestRate?: number;
    paymentTerms?: string;
}

export interface LoanAdjustmentRequest {
    adjustmentType: 'payment' | 'increase' | 'decrease' | 'waive';
    amount: number;
    reason?: string;
    notes?: string;
    paymentMethod?: string;
    paymentDate?: string;
}

export interface CreateLoanFromGroupRequest {
    groupId: string;
    borrowerUserId: string;
    amount: number;
    description?: string;
    dueDate?: string;
    notes?: string;
}

export interface LoanQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'paid' | 'waived' | 'cancelled';
    role?: 'lender' | 'borrower' | 'all';
    sortBy?: 'dueDate' | 'amount' | 'loanDate' | 'createdAt' | 'status';
    sortOrder?: 'asc' | 'desc';
}

// Legacy types for backward compatibility
export interface LoanPayment {
    id: string;
    loanId: string;
    amount: number;
    paymentDate: string;
    notes?: string;
    createdAt: string;
}

export type CreateLoanDto = CreateLoanRequest;
export type UpdateLoanDto = Partial<CreateLoanRequest> & {
    status?: 'active' | 'paid' | 'waived' | 'cancelled';
};
export type AddLoanPaymentDto = {
    amount: number;
    paymentDate: string;
    notes?: string;
};
export type LoanSummary = LoanStatistics;
