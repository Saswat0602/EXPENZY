export interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    avatarSeed?: string;
    avatarStyle?: string;
    avatarUrl?: string;
    defaultCurrency: 'USD' | 'EUR' | 'INR';
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
    defaultCurrency?: 'USD' | 'EUR' | 'INR';
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface DeleteAccountDto {
    password: string;
}
