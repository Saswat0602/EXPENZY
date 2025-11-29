export interface Income {
    id: string;
    userId: string;
    categoryId: string;
    amount: number;
    currency: string;
    source: string;
    description?: string;
    incomeDate: string;
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

export interface CreateIncomeDto {
    categoryId: string;
    amount: number;
    currency?: string;
    source: string;
    description?: string;
    incomeDate: string;
    paymentMethod?: string;
    notes?: string;
    isRecurring?: boolean;
}

export type UpdateIncomeDto = Partial<CreateIncomeDto>;


export interface IncomeFilters {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
}
