'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ROUTES } from '@/lib/routes';
import type { User, AuthState, LoginCredentials, SignupCredentials, AuthResponse } from '@/types';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (credentials: SignupCredentials) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        // Check for existing auth on mount
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr) as User;
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        } else {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await apiClient.post<AuthResponse>(
                API_ENDPOINTS.AUTH.LOGIN,
                credentials
            );

            const { user, access_token } = response;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            apiClient.setToken(access_token);

            setState({
                user,
                token: access_token,
                isAuthenticated: true,
                isLoading: false,
            });

            router.push(ROUTES.DASHBOARD);
        } catch (error) {
            throw error;
        }
    };

    const signup = async (credentials: SignupCredentials) => {
        try {
            const response = await apiClient.post<AuthResponse>(
                API_ENDPOINTS.AUTH.SIGNUP,
                credentials
            );

            const { user, access_token } = response;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            apiClient.setToken(access_token);

            setState({
                user,
                token: access_token,
                isAuthenticated: true,
                isLoading: false,
            });

            router.push(ROUTES.DASHBOARD);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });

        router.push(ROUTES.LOGIN);
    };

    const refreshUser = async () => {
        try {
            const user = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
            localStorage.setItem('user', JSON.stringify(user));
            setState((prev) => ({ ...prev, user }));
        } catch {
            logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                signup,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
