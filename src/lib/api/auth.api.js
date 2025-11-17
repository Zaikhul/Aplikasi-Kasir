import { apiClient, setToken, clearToken } from '../apiClient'

/**
 * Auth API Service
 * Matches backend AuthController endpoints
 */

export const authApi = {
  /**
   * Login user
   * POST /auth/login
   */
  login: async (email, password) => {
    const response = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    })
    
    if (response && response.access_token) {
      setToken(response.access_token)
      return response
    }
    throw new Error('Invalid response from server')
  },

  /**
   * Register user
   * POST /auth/register
   */
  register: async (userData) => {
    return await apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        businessName: userData.businessName || '',
      }),
    })
  },

  /**
   * Logout user
   */
  logout: () => {
    clearToken()
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

