import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface GroupStatistics {
    totalExpenses: number;
    totalSpending: number;
    yourTotalSpending: number;
    yourShare: number;
    averageExpense: number;
    expenseCount: number;
    categoryBreakdown: Record<string, number>;
}

export interface MonthlyAnalytics {
    months: Array<{
        month: string;
        year: number;
        totalSpending: number;
        yourShare: number;
        expenseCount: number;
        categories: Record<string, number>;
    }>;
    summary: {
        totalMonths: number;
        avgMonthlySpending: number;
    };
}

/**
 * Hook to fetch group statistics
 */
export function useGroupStatistics(groupId: string) {
    return useQuery({
        queryKey: ['group-statistics', groupId],
        queryFn: () => apiClient.get<GroupStatistics>(
            API_ENDPOINTS.GROUPS.STATISTICS(groupId)
        ),
        enabled: !!groupId,
    });
}

/**
 * Hook to fetch monthly analytics
 */
export function useMonthlyAnalytics(groupId: string, months: number = 6) {
    return useQuery({
        queryKey: ['monthly-analytics', groupId, months],
        queryFn: () => apiClient.get<MonthlyAnalytics>(
            API_ENDPOINTS.GROUPS.MONTHLY_ANALYTICS(groupId, months)
        ),
        enabled: !!groupId,
    });
}
