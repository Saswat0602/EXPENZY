export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface Split {
    id: string;
    groupExpenseId: string;
    userId: string;
    amountOwed: string;
    amountPaid: string;
    percentage?: string;
    shares?: string;
    isRoundingAdjustment: boolean;
    calculatedAmount: string;
    adjustmentAmount: string;
    isPaid: boolean;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
}

export interface GroupExpense {
    id: string;
    groupId: string;
    paidByUserId: string;
    amount: string;
    currency: string;
    description: string;
    expenseDate: string;
    notes?: string;
    splitType: SplitType;
    isSettled: boolean;
    splitValidationStatus?: string;
    hasAdjustments?: boolean;
    splits: Split[];
    paidBy: {
        id: string;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
    category?: {
        id: string;
        name: string;
        icon?: string;
        color?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateExpenseData {
    description: string;
    amount: number;
    paidByUserId: string;
    splitType: SplitType;
    expenseDate?: string;
    notes?: string;
    categoryId?: string;
    participants: ParticipantInput[];
    currency?: string;
}

export interface UpdateExpenseData {
    description?: string;
    amount?: number;
    splitType?: SplitType;
    expenseDate?: string;
    notes?: string;
    categoryId?: string;
    participants?: ParticipantInput[];
}

export interface ParticipantInput {
    userId: string;
    amount?: number;      // For 'exact' split
    percentage?: number;  // For 'percentage' split
    shares?: number;      // For 'shares' split
}

export interface Balance {
    userId: string;
    totalPaid: string;
    totalOwed: string;
    balance: number;
    formatted: {
        text: string;
        color: 'green' | 'red' | 'neutral';
    };
}

export interface SimplifiedDebt {
    fromUserId: string;
    toUserId: string;
    amount: number;
    fromUser?: {
        id: string;
        username: string;
        email: string;
    };
    toUser?: {
        id: string;
        username: string;
        email: string;
    };
}

export interface Settlement {
    id: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    amount: string;
    currency: string;
    settledAt: string;
    notes?: string;
    status: 'pending' | 'confirmed' | 'disputed' | 'resolved';
    fromUser?: {
        username: string;
    };
    toUser?: {
        username: string;
    };
}

// Legacy types for backwards compatibility
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
