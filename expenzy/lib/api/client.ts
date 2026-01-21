import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor - add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                console.log('[API Client] Request to:', config.url);
                console.log('[API Client] Token exists:', !!token);
                if (token) {
                    console.log('[API Client] Token (first 20 chars):', token.substring(0, 20));
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - handle errors
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                console.log('[API Client] Response from:', response.config.url, 'Status:', response.status);
                return response;
            },
            async (error: AxiosError<ApiError>) => {
                console.error('[API Client] Error:', error.message);
                console.error('[API Client] Error response:', error.response?.status, error.response?.data);

                if (error.response?.status === 401) {
                    console.error('[API Client] 401 Unauthorized - Token expired or invalid');

                    // Only handle logout if not already on login/signup pages
                    if (typeof window !== 'undefined') {
                        const currentPath = window.location.pathname;
                        const isAuthPage = currentPath === '/login' || currentPath === '/signup' || currentPath === '/forgot-password';

                        if (!isAuthPage) {
                            console.error('[API Client] Clearing token and redirecting to login');

                            // Clear all auth data
                            this.clearToken();

                            // Show toast notification (dynamically import to avoid SSR issues)
                            import('sonner').then(({ toast }) => {
                                toast.error('Session expired. Please login again.');
                            });

                            // Redirect to login with return URL
                            const returnUrl = encodeURIComponent(currentPath);
                            window.location.href = `/login?returnUrl=${returnUrl}`;
                        }
                    }
                }
                return Promise.reject(this.handleError(error));
            }
        );
    }

    private handleError(error: AxiosError<ApiError>): ApiError {
        if (error.response) {
            return {
                message: error.response.data.message || 'An error occurred',
                statusCode: error.response.status,
                error: error.response.data.error,
            };
        }

        if (error.request) {
            return {
                message: 'No response from server',
                statusCode: 0,
            };
        }

        return {
            message: error.message || 'An unexpected error occurred',
            statusCode: 0,
        };
    }

    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    }

    private clearToken(): void {
        if (typeof window === 'undefined') return;

        const oldToken = localStorage.getItem('token');

        // Clear all auth-related data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage'); // Zustand persist key

        // Dispatch storage event for multi-tab synchronization
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'token',
            oldValue: oldToken,
            newValue: null,
            storageArea: localStorage,
        }));
    }

    public setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('token', token);
    }

    // Generic request methods
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<ApiResponse<T>>(url, config);
        return response.data.data;
    }

    async getRaw<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<ApiResponse<T>>(url, data, config);
        return response.data.data;
    }

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<ApiResponse<T>>(url, data, config);
        return response.data.data;
    }

    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<ApiResponse<T>>(url, data, config);
        return response.data.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<ApiResponse<T>>(url, config);
        return response.data.data;
    }
}

export const apiClient = new ApiClient();
