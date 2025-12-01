export interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    defaultCurrency: string;
    timezone: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    twoFactorEnabled: boolean;
    lastPasswordChange?: string;
    googleId?: string;
}

export interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    timezone?: string;
    defaultCurrency?: 'USD' | 'EUR' | 'GBP' | 'INR';
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface DeleteAccountDto {
    confirmation: string;
    password: string;
}
