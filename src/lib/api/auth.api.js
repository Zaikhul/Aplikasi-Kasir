import { apiClient, setToken, clearToken } from '../apiClient'

/**
 * Auth API Service
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

export const authApi = {
    /**
     * Login user
     * POST /auth/login
     */
    login: async (email, password) => {
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || 'Login failed')
        }

        const data = await response.json()

        if (data && data.access_token) {
            await setToken(data.access_token)
            return data
        }
        throw new Error('Invalid response from server')
    },

    /**
     * Register user
     * POST /auth/register
     */
    register: async (userData) => {
        const response = await fetch(`${BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: userData.name,
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                businessName: userData.businessName || '',
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || 'Registration failed')
        }

        return await response.json()
    },

    /**
     * Logout user
     */
    logout: async () => {
        await clearToken()
    },

    /**
     * Fetch authenticated user's profile
     * GET /auth/me
     */
    getProfile: async () => {
        return await apiClient('/auth/me')
    },

    /**
     * Update authenticated user's profile
     * PUT /auth/profile
     */
    updateProfile: async (profileData = {}) => {
        return await apiClient('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        })
    },
}
