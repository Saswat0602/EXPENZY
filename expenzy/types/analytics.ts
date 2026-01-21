export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface AnalyticsQuery {
    period?: AnalyticsPeriod;
    startDate?: string;
    endDate?: string;
}

export interface DashboardSummary {
    period: AnalyticsPeriod;
    dateRange: {
        start: string;
        end: string;
    };
    summary: {
        totalIncome: number;
        totalExpenses: number;
        netSavings: number;
        savingsRate: number;
        totalBalance: number;
        loanSummary: {
            totalLent: number;
            totalBorrowed: number;
            netPosition: number;
            type: 'lent' | 'borrowed';
            amount: number;
        };
    };
    budgets: Array<{
        id: string;
        categoryName: string;
        amount: number;
        spentAmount: number;
        utilization: number;
    }>;
    savingsGoals: Array<{
        id: string;
        name: string;
        targetAmount: number;
        currentAmount: number;
        progress: number;
    }>;
    upcomingSubscriptions: Array<{
        id: string;
        name: string;
        amount: number;
        nextBillingDate: string;
    }>;
    recentTransactions: Array<{
        id: string;
        type: 'expense' | 'income';
        amount: number;
        description: string;
        date: string;
        category?: {
            name: string;
            icon?: string;
            color?: string;
        };
    }>;
    topCategories: Array<{
        categoryId: string;
        categoryName: string;
        categoryIcon?: string;
        categoryColor?: string;
        totalAmount: number;
        transactionCount: number;
    }>;
}

export interface SpendingTrends {
    period: AnalyticsPeriod;
    dateRange: {
        start: string;
        end: string;
    };
    trend: Array<{
        date: string;
        amount: number;
    }>;
    totalExpenses: number;
    averageDaily: number;
}

export interface CategoryBreakdown {
    period: AnalyticsPeriod;
    dateRange: {
        start: string;
        end: string;
    };
    breakdown: Array<{
        categoryId: string;
        categoryName: string;
        categoryIcon?: string;
        categoryColor?: string;
        totalAmount: number;
        transactionCount: number;
        averageAmount: number;
        percentage: number;
    }>;
    totalExpenses: number;
}

export interface CashFlow {
    period: AnalyticsPeriod;
    dateRange: {
        start: string;
        end: string;
    };
    cashFlow: Array<{
        date: string;
        income: number;
        expense: number;
        net: number;
    }>;
    summary: {
        totalIncome: number;
        totalExpense: number;
        netCashFlow: number;
        averageDailyIncome: number;
        averageDailyExpense: number;
    };
}
