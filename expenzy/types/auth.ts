import type { User } from './index';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
    username: string;  // Backend expects 'username' not 'name'
}

export interface AuthResponse {
    user: User;
    access_token: string;  // Backend returns 'access_token' not 'accessToken'
    refreshToken?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
