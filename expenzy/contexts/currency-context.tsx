'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { CurrencyCode } from '@/lib/utils/currency';

interface CurrencyContextType {
    currency: CurrencyCode;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const currency = (user?.defaultCurrency as CurrencyCode) || 'INR';

    return (
        <CurrencyContext.Provider value={{ currency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within CurrencyProvider');
    }
    return context;
}
