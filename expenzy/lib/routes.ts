/**
 * Centralized route definitions for the application
 */

export const ROUTES = {
    // Public routes
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',

    // Dashboard routes
    DASHBOARD: '/dashboard',
    TRANSACTIONS: '/dashboard/transactions',
    RECURRING_EXPENSES: '/dashboard/recurring-expenses',
    ANALYTICS: '/dashboard/analytics',
    BUDGET: '/dashboard/budget',
    SAVINGS: '/dashboard/savings',
    // SUBSCRIPTIONS: '/dashboard/subscriptions', // Removed
    GROUPS: '/dashboard/groups',
    LOANS: '/dashboard/loans',
    PROFILE: '/dashboard/profile',
    NOTIFICATIONS: '/dashboard/notifications',
    PAYMENT_METHODS: '/dashboard/payment-methods',
    TAGS: '/dashboard/tags',
    ACCOUNTS: '/dashboard/accounts',

    // Settings
    SETTINGS: '/dashboard/settings',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
