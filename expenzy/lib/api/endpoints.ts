export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/profile',
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
        EXPENSE: '/categories?type=EXPENSE',
        INCOME: '/categories?type=INCOME',
        GROUP: '/categories?type=GROUP',
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
        BASE: '/savings/goals',
        BY_ID: (id: string) => `/savings/goals/${id}`,
        CONTRIBUTE: (id: string) => `/savings/goals/${id}/contributions`,
    },

    // Alias for backwards compatibility
    SAVINGS_GOALS: {
        BASE: '/savings/goals',
        BY_ID: (id: string) => `/savings/goals/${id}`,
        CONTRIBUTE: (id: string) => `/savings/goals/${id}/contributions`,
        PROGRESS: '/savings/goals/progress',
    },

    // Subscriptions
    SUBSCRIPTIONS: {
        BASE: '/subscriptions',
        BY_ID: (id: string) => `/subscriptions/${id}`,
        UPCOMING: '/subscriptions/upcoming',
        SUMMARY: '/subscriptions/summary',
    },

    // Tags
    TAGS: {
        BASE: '/tags',
        LIST: '/tags',
        BY_ID: (id: string) => `/tags/${id}`,
    },

    // Payment Methods
    PAYMENT_METHODS: {
        BASE: '/payment-methods',
        LIST: '/payment-methods',
        BY_ID: (id: string) => `/payment-methods/${id}`,
        SET_DEFAULT: (id: string) => `/payment-methods/${id}/set-default`,
    },

    // Groups
    GROUPS: {
        LIST: '/groups',
        BY_ID: (id: string) => `/groups/${id}`,
        MEMBERS: (id: string) => `/groups/${id}/members`,
        EXPENSES: (id: string) => `/groups/${id}/expenses`,
    },

    // Loans
    LOANS: {
        LIST: '/loans',
        BY_ID: (id: string) => `/loans/${id}`,
        PAYMENTS: (id: string) => `/loans/${id}/payments`,
    },

    // Accounts
    ACCOUNTS: {
        LIST: '/accounts',
        BY_ID: (id: string) => `/accounts/${id}`,
        TRANSACTIONS: (id: string) => `/accounts/${id}/transactions`,
        TOTAL_BALANCE: '/accounts/total-balance',
    },

    // Notifications
    NOTIFICATIONS: {
        BASE: '/notifications',
        LIST: '/notifications',
        BY_ID: (id: string) => `/notifications/${id}`,
        MARK_READ: (id: string) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
        SUMMARY: '/notifications/summary',
    },
} as const;
