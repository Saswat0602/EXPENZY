export interface Budget {
    id: string;
    userId: string;
    categoryId?: string;
    amount: number;
    spentAmount: number;
    currency: string;
    periodType: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    startDate: string;
    endDate: string;
    alertThreshold?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category?: {
        id: string;
        name: string;
        icon?: string;
        color?: string;
    };
}

export interface CreateBudgetDto {
    categoryId?: string;
    amount: number;
    currency?: string;
    periodType: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    startDate: string;
    endDate?: string;
    alertThreshold?: number;
}

export interface UpdateBudgetDto extends Partial<CreateBudgetDto> {
    isActive?: boolean;
}

export interface BudgetPerformance {
    budgetId: string;
    categoryName: string;
    categoryIcon?: string;
    amount: number;
    spentAmount: number;
    remaining: number;
    utilization: number;
    status: 'on_track' | 'warning' | 'exceeded';
    periodType: string;
    startDate: string;
    endDate: string;
}
