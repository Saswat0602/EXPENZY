import { format, parseISO, formatDistanceToNow, isToday, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
    try {
        if (!date) return 'N/A';
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (isNaN(dateObj.getTime())) return 'Invalid Date';
        return format(dateObj, formatStr);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
}

import { formatCurrency as formatCurrencyUtil, CurrencyCode } from './currency';

export function formatCurrency(amount: number | string, currency: CurrencyCode = 'INR'): string {
    return formatCurrencyUtil(amount, currency);
}

export function formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
        return 'Today';
    }

    if (isYesterday(dateObj)) {
        return 'Yesterday';
    }

    return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

export function getDateRangeForPeriod(period: 'week' | 'month' | 'quarter' | 'year'): { start: Date; end: Date } {
    const now = new Date();

    switch (period) {
        case 'week':
            return {
                start: startOfWeek(now),
                end: endOfWeek(now),
            };
        case 'month':
            return {
                start: startOfMonth(now),
                end: endOfMonth(now),
            };
        case 'quarter': {
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
            return { start: quarterStart, end: quarterEnd };
        }
        case 'year':
            return {
                start: new Date(now.getFullYear(), 0, 1),
                end: new Date(now.getFullYear(), 11, 31),
            };
        default:
            return { start: startOfMonth(now), end: endOfMonth(now) };
    }
}
