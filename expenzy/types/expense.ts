export interface Expense {
    id: string;
    userId: string;
    categoryId: string;
    amount: number;
    currency: string;
    description: string;
    expenseDate: string;
    paymentMethod?: string;
    notes?: string;
    isRecurring: boolean;
    recurringPatternId?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    category?: {
        id: string;
        name: string;
        icon?: string;
        color?: string;
    };
}

export interface CreateExpenseDto {
    categoryId: string;
    amount: number;
    currency?: string;
    description: string;
    expenseDate: string;
    paymentMethod?: string;
    notes?: string;
    isRecurring?: boolean;
}

export type UpdateExpenseDto = Partial<CreateExpenseDto>;

export interface ExpenseFilters {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    minAmount?: number;
    maxAmount?: number;
    paymentMethod?: string;
    search?: string;
}
