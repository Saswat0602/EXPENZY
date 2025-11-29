export interface Split {
    id: string;
    groupExpenseId: string;
    userId: string;
    amount: number;
    percentage?: number;
    settled: boolean;
    settledAt?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface CreateSplitDto {
    userId: string;
    amount?: number;
    percentage?: number;
}

export interface SettleSplitDto {
    splitIds: string[];
    paymentMethod?: string;
    notes?: string;
}

export interface SplitSummary {
    userId: string;
    userName: string;
    totalOwed: number;
    totalPaid: number;
    balance: number;
}
