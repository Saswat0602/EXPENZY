export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface Split {
    id: string;
    groupExpenseId: string;
    memberId: string;
    userId?: string;
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
    member?: {
        id: string;
        contactName?: string | null;
        contactAvatar?: string | null;
        userId?: string | null;
        user?: {
            id: string;
            username: string;
            firstName?: string;
            lastName?: string;
            avatarSeed?: string;
            avatarStyle?: string;
            avatarUrl?: string;
        } | null;
        contact?: {
            id: string;
            contactName?: string | null;
            contactEmail?: string | null;
            contactPhone?: string | null;
            contactAvatar?: string | null;
        } | null;
    };
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
    paidByMemberId: string;
    paidByUserId?: string;
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
    paidByMember: {
        id: string;
        contactName?: string | null;
        contactAvatar?: string | null;
        userId?: string | null;
        user?: {
            id: string;
            username: string;
            firstName?: string;
            lastName?: string;
            avatarSeed?: string;
            avatarStyle?: string;
            avatarUrl?: string;
        } | null;
        contact?: {
            id: string;
            contactName?: string | null;
            contactEmail?: string | null;
            contactPhone?: string | null;
            contactAvatar?: string | null;
        } | null;
    };
    paidBy: {
        id: string;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
        avatarSeed?: string;
        avatarStyle?: string;
        avatarUrl?: string;
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
    paidByMemberId: string;
    paidByUserId?: string;
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
    memberId: string;
    userId?: string;
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
    fromMemberId: string;
    toMemberId: string;
    fromUserId?: string;
    toUserId?: string;
    amount: number;
    fromMember?: {
        id: string;
        name: string;
        avatar?: string;
        userId?: string | null;
    };
    toMember?: {
        id: string;
        name: string;
        avatar?: string;
        userId?: string | null;
    };
    fromUser?: {
        id: string;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
    toUser?: {
        id: string;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
}

export interface Settlement {
    id: string;
    groupId: string;
    fromMemberId: string;
    toMemberId: string;
    fromUserId?: string;
    toUserId?: string;
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
