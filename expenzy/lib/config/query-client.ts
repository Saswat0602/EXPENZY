import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            // Custom retry logic: don't retry on auth errors (401, 403)
            retry: (failureCount, error: unknown) => {
                const err = error as { response?: { status?: number } };
                // Don't retry on authentication errors
                if (err?.response?.status === 401 || err?.response?.status === 403) {
                    console.log('[Query Client] Skipping retry for auth error:', err?.response?.status);
                    return false;
                }
                // Don't retry on 404 errors
                if (err?.response?.status === 404) {
                    console.log('[Query Client] Skipping retry for 404 error');
                    return false;
                }
                // Retry other errors max 1 time
                return failureCount < 1;
            },
            refetchOnMount: true,
        },
        mutations: {
            retry: 0,
        },
    },
});

// Query keys for consistent cache management
export const QUERY_KEYS = {
    AUTH: {
        ME: ['auth', 'me'] as const,
    },
    EXPENSES: {
        ALL: ['expenses'] as const,
        LIST: (filters?: Record<string, unknown>) => ['expenses', 'list', filters] as const,
        DETAIL: (id: string) => ['expenses', 'detail', id] as const,
        STATS: ['expenses', 'stats'] as const,
    },
    INCOME: {
        ALL: ['income'] as const,
        LIST: (filters?: Record<string, unknown>) => ['income', 'list', filters] as const,
        DETAIL: (id: string) => ['income', 'detail', id] as const,
        STATS: ['income', 'stats'] as const,
    },
    CATEGORIES: {
        ALL: ['categories'] as const,
        LIST: (type?: 'EXPENSE' | 'INCOME' | 'GROUP') => ['categories', 'list', type] as const,
        DETAIL: (id: string) => ['categories', 'detail', id] as const,
    },
    BUDGETS: {
        ALL: ['budgets'] as const,
        LIST: ['budgets', 'list'] as const,
        DETAIL: (id: string) => ['budgets', 'detail', id] as const,
        PERFORMANCE: ['budgets', 'performance'] as const,
    },
    SAVINGS: {
        ALL: ['savings'] as const,
        LIST: ['savings', 'list'] as const,
        DETAIL: (id: string) => ['savings', 'detail', id] as const,
        PROGRESS: ['savings', 'progress'] as const,
    },
    SUBSCRIPTIONS: {
        ALL: ['subscriptions'] as const,
        LIST: ['subscriptions', 'list'] as const,
        DETAIL: (id: string) => ['subscriptions', 'detail', id] as const,
        SUMMARY: ['subscriptions', 'summary'] as const,
        UPCOMING: ['subscriptions', 'upcoming'] as const,
    },
    ANALYTICS: {
        DASHBOARD: (period?: string) => ['analytics', 'dashboard', period] as const,
        SPENDING_TRENDS: (period?: string) => ['analytics', 'spending-trends', period] as const,
        CATEGORY_BREAKDOWN: (period?: string) => ['analytics', 'category-breakdown', period] as const,
        CASH_FLOW: (period?: string) => ['analytics', 'cash-flow', period] as const,
    },
} as const;
