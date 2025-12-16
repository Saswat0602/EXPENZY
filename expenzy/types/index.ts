// Re-export all types
export * from './api';
export * from './auth';
export interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    defaultCurrency: 'INR' | 'USD' | 'EUR';
    timezone: string;
    profilePictureUrl?: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
    avatar?: string;
    avatarSeed?: string;
    avatarStyle?: string;
    avatarUrl?: string;
    googleId?: string;
    monthlyIncomeTarget?: number;
    monthlyExpenseTarget?: number;
    onboardingCompleted: boolean;
    twoFactorEnabled: boolean;
    lastPasswordChange?: string;
}
export * from './category';
export * from './expense';
export * from './income';
export * from './budget';
export * from './analytics';
export * from './group';
export * from './split';
export * from './loan';
export * from './savings-goal';

export * from './tag';
export * from './payment-method';
export * from './account';
export * from './notification';
