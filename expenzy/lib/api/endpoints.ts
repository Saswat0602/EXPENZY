export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signup',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
    },

    // Users
    USERS: {
        BASE: '/users',
        PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/profile',
    },

    // Expenses
    EXPENSES: {
        BASE: '/expenses',
        BY_ID: (id: string) => `/expenses/${id}`,
        STATS: '/expenses/stats',
    },

    // Income
    INCOME: {
        BASE: '/income',
        BY_ID: (id: string) => `/income/${id}`,
        STATS: '/income/stats',
    },

    // Categories
    CATEGORIES: {
        BASE: '/categories',
        BY_ID: (id: string) => `/categories/${id}`,
        EXPENSE: '/categories?type=expense',
        INCOME: '/categories?type=income',
    },

    // Budgets
    BUDGETS: {
        BASE: '/budgets',
        BY_ID: (id: string) => `/budgets/${id}`,
        PERFORMANCE: '/analytics/budget-performance',
    },

    // Analytics
    ANALYTICS: {
        DASHBOARD: '/analytics/dashboard',
        SPENDING_TRENDS: '/analytics/spending-trends',
        CATEGORY_BREAKDOWN: '/analytics/category-breakdown',
        CASH_FLOW: '/analytics/cash-flow',
        BUDGET_PERFORMANCE: '/analytics/budget-performance',
    },

    // Savings Goals
    SAVINGS: {
        BASE: '/savings',
        BY_ID: (id: string) => `/savings/${id}`,
        CONTRIBUTE: (id: string) => `/savings/${id}/contribute`,
    },

    // Subscriptions
    SUBSCRIPTIONS: {
        BASE: '/subscriptions',
        BY_ID: (id: string) => `/subscriptions/${id}`,
    },

    // Tags
    TAGS: {
        BASE: '/tags',
        BY_ID: (id: string) => `/tags/${id}`,
    },

    // Payment Methods
    PAYMENT_METHODS: {
        BASE: '/payment-methods',
        BY_ID: (id: string) => `/payment-methods/${id}`,
        SET_DEFAULT: (id: string) => `/payment-methods/${id}/set-default`,
    },

    // Notifications
    NOTIFICATIONS: {
        BASE: '/notifications',
        BY_ID: (id: string) => `/notifications/${id}`,
        MARK_READ: (id: string) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
        SUMMARY: '/notifications/summary',
    },
} as const;
