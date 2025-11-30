// Re-export all types
export * from './api';
export * from './auth';
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    defaultCurrency?: 'INR' | 'USD' | 'EUR';
    createdAt: string;
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
export * from './subscription';
export * from './tag';
export * from './payment-method';
export * from './account';
export * from './notification';
