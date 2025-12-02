// Currency constants based on backend support
export const CURRENCIES = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'INR', label: 'INR - Indian Rupee' },
] as const;

export type Currency = typeof CURRENCIES[number]['value'];
