/**
 * Currency utilities for multi-currency support
 */

export const CURRENCIES = {
    INR: {
        code: 'INR',
        symbol: '₹',
        name: 'Indian Rupee',
        locale: 'en-IN',
    },
    USD: {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        locale: 'en-US',
    },
    EUR: {
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        locale: 'de-DE',
    },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatCurrency(
    amount: number | string,
    currency: CurrencyCode = 'INR'
): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const { symbol, locale, code } = CURRENCIES[currency];

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numAmount);
}

export function getCurrencySymbol(currency: CurrencyCode = 'INR'): string {
    return CURRENCIES[currency].symbol;
}

export function getCurrencyName(currency: CurrencyCode = 'INR'): string {
    return CURRENCIES[currency].name;
}

export function getAllCurrencies() {
    return Object.entries(CURRENCIES).map(([code, info]) => ({
        code: code as CurrencyCode,
        ...info,
    }));
}
