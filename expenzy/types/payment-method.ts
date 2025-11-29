export interface PaymentMethod {
    id: string;
    userId: string;
    name: string;
    type: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'other';
    lastFourDigits?: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentMethodDto {
    name: string;
    type: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'other';
    lastFourDigits?: string;
    isDefault?: boolean;
}


export type UpdatePaymentMethodDto = Partial<CreatePaymentMethodDto>;

