/**
 * Auth API Service
 * Handles authentication endpoints: login, register, logout, profile
 */

import { apiClient, setToken, clearToken } from '../apiClient';

export interface LoginResponse {
    access_token: string;
    user?: AuthUser;
}

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    businessInfo?: {
        businessName?: string;
        address?: string;
        phone?: string;
        taxId?: string;
    };
    subscription?: {
        plan?: string;
        status?: string;
        currentPeriodEnd?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    businessName?: string;
}

export interface RegisterResponse {
    email: string;
    name: string;
    _id: string;
}

export interface ProfileUpdateData {
    name?: string;
    businessInfo?: {
        businessName?: string;
        address?: string;
        phone?: string;
        taxId?: string;
    };
}

export const authApi = {
    /**
     * Login user
     * POST /auth/login
     */
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await fetch('/api/proxy/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error((errorData as { message?: string }).message || 'Login failed');
        }

        const responseData = await response.json();

        const payload = responseData?.data;
        const token = payload?.access_token;
        const user = payload?.user;

        if (token) {
            await setToken(token);

            if (user) {
                const { resetAuthCache } = await import('@/hooks/useAuth');
                resetAuthCache(user);
            }

            return {
                access_token: token,
                user,
            };
        }

        throw new Error('Login failed: Server did not return authentication token');
    },

    /**
     * Register user
     * POST /auth/register
     */
    register: async (userData: RegisterData): Promise<RegisterResponse> => {
        const response = await fetch('/api/proxy/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: userData.name,
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                businessName: userData.businessName || '',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error((errorData as { message?: string }).message || 'Registration failed');
        }

        return await response.json() as RegisterResponse;
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        await clearToken();
    },

    /**
     * Fetch authenticated user's profile
     * GET /auth/me
     */
    getProfile: async (): Promise<AuthUser> => {
        return await apiClient<AuthUser>('/auth/me');
    },

    /**
     * Update authenticated user's profile
     * PUT /auth/profile
     */
    updateProfile: async (profileData: ProfileUpdateData = {}): Promise<AuthUser> => {
        return await apiClient<AuthUser>('/auth/profile', {
            method: 'PUT',
            body: profileData,
        });
    },
};
