export interface Subscription {
    id: string;
    userId: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    billingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    nextBillingDate: string;
    endDate?: string;
    category?: string;
    paymentMethod?: string;
    isActive: boolean;
    reminderDays?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubscriptionDto {
    name: string;
    description?: string;
    amount: number;
    currency?: string;
    billingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    endDate?: string;
    category?: string;
    paymentMethod?: string;
    reminderDays?: number;
    notes?: string;
}

export interface UpdateSubscriptionDto extends Partial<CreateSubscriptionDto> {
    isActive?: boolean;
}

export interface SubscriptionSummary {
    totalMonthly: number;
    totalYearly: number;
    activeCount: number;
    upcomingRenewals: Array<{
        id: string;
        name: string;
        amount: number;
        nextBillingDate: string;
        daysUntil: number;
    }>;
    categoryBreakdown: Array<{
        category: string;
        totalAmount: number;
        count: number;
    }>;
}
