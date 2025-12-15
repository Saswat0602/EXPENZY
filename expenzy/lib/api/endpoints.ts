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
        EXPENSE_BY_ID: (groupId: string, expenseId: string) => `/groups/${groupId}/expenses/${expenseId}`,
        BALANCES: (id: string) => `/groups/${id}/balances`,
        USER_BALANCE: (groupId: string, userId: string) => `/groups/${groupId}/balances/user/${userId}`,
        SIMPLIFIED_DEBTS: (id: string) => `/groups/${id}/balances/simplified`,
        SETTLE_EXPENSE: (groupId: string, expenseId: string) => `/groups/${groupId}/expenses/${expenseId}/settle`,
        SETTLEMENTS: (id: string) => `/groups/${id}/settlements`,
        STATISTICS: (id: string) => `/groups/${id}/statistics`,
        MONTHLY_ANALYTICS: (id: string, months?: number) => `/groups/${id}/monthly-analytics${months ? `?months=${months}` : ''}`,
    },

    // Loans
    LOANS: {
        LIST: '/loans',
        BY_ID: (id: string) => `/loans/${id}`,
        PAYMENTS: (id: string) => `/loans/${id}/payments`,
        CONSOLIDATED: '/loans/consolidated',
        STATISTICS: '/loans/statistics',
        GROUP_BALANCES: '/loans/group-balances',
        FROM_GROUP: '/loans/from-group',
        ADJUSTMENTS: (id: string) => `/loans/${id}/adjustments`,
        TRANSACTIONS: (otherUserId: string) => `/loans/transactions/${otherUserId}`,
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

    // Avatars
    AVATARS: {
        BY_SEED: (seed: string) => `/avatars/${seed}`,
        BY_STYLE_AND_SEED: (style: string, seed: string) => `/avatars/${style}/${seed}`,
    },

    // User Settings
    USER_SETTINGS: '/user-settings',

    // Export
    EXPORT: {
        GROUP: (groupId: string) => `/export/group/${groupId}`,
        EXPENSES: '/export/expenses',
        TRANSACTIONS: '/export/transactions',
        DOWNLOAD: (filename: string) => `/export/download/${filename}`,
    },

    // Recurring Expenses
    RECURRING_EXPENSES: {
        BASE: '/expenses/recurring',
        BY_ID: (id: string) => `/expenses/recurring/${id}`,
    },

    // Attachments
    ATTACHMENTS: {
        UPLOAD: '/attachments/upload',
        BY_ENTITY: (entityType: string, entityId: string) => `/attachments/${entityType}/${entityId}`,
        DOWNLOAD: (id: string) => `/attachments/file/${id}`,
        DELETE: (id: string) => `/attachments/${id}`,
    },

    // Reminders
    REMINDERS: {
        BASE: '/reminders',
        BY_ID: (id: string) => `/reminders/${id}`,
        MARK_READ: (id: string) => `/reminders/${id}/read`,
    },
} as const;
