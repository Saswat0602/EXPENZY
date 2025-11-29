export interface Account {
    id: string;
    userId: string;
    name: string;
    type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'other';
    balance: number;
    currency: string;
    institution?: string;
    accountNumber?: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAccountDto {
    name: string;
    type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'other';
    balance: number;
    currency?: string;
    institution?: string;
    accountNumber?: string;
    isDefault?: boolean;
}


export type UpdateAccountDto = Partial<CreateAccountDto>;


export interface AccountSummary {
    totalBalance: number;
    accountCount: number;
    byType: Array<{
        type: string;
        balance: number;
        count: number;
    }>;
}
