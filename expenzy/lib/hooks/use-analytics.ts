import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/config/query-client';
import type {
    DashboardSummary,
    SpendingTrends,
    CategoryBreakdown,
    CashFlow,
    AnalyticsQuery,
} from '@/types';

export function useDashboardSummary(query?: AnalyticsQuery) {
    return useQuery({
        queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD(query?.period),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (query?.period) params.append('period', query.period);
            if (query?.startDate) params.append('startDate', query.startDate);
            if (query?.endDate) params.append('endDate', query.endDate);

            const url = `${API_ENDPOINTS.ANALYTICS.DASHBOARD}?${params.toString()}`;
            return apiClient.get<DashboardSummary>(url);
        },
    });
}

export function useSpendingTrends(query?: AnalyticsQuery) {
    return useQuery({
        queryKey: QUERY_KEYS.ANALYTICS.SPENDING_TRENDS(query?.period),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (query?.period) params.append('period', query.period);
            if (query?.startDate) params.append('startDate', query.startDate);
            if (query?.endDate) params.append('endDate', query.endDate);

            const url = `${API_ENDPOINTS.ANALYTICS.SPENDING_TRENDS}?${params.toString()}`;
            return apiClient.get<SpendingTrends>(url);
        },
    });
}

export function useCategoryBreakdown(query?: AnalyticsQuery) {
    return useQuery({
        queryKey: QUERY_KEYS.ANALYTICS.CATEGORY_BREAKDOWN(query?.period),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (query?.period) params.append('period', query.period);
            if (query?.startDate) params.append('startDate', query.startDate);
            if (query?.endDate) params.append('endDate', query.endDate);

            const url = `${API_ENDPOINTS.ANALYTICS.CATEGORY_BREAKDOWN}?${params.toString()}`;
            return apiClient.get<CategoryBreakdown>(url);
        },
    });
}

export function useCashFlow(query?: AnalyticsQuery) {
    return useQuery({
        queryKey: QUERY_KEYS.ANALYTICS.CASH_FLOW(query?.period),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (query?.period) params.append('period', query.period);
            if (query?.startDate) params.append('startDate', query.startDate);
            if (query?.endDate) params.append('endDate', query.endDate);

            const url = `${API_ENDPOINTS.ANALYTICS.CASH_FLOW}?${params.toString()}`;
            return apiClient.get<CashFlow>(url);
        },
    });
}
