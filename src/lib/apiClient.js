/**
 * API Client with HttpOnly Cookie Authentication
 */

/**
 * Set authentication token via httpOnly cookie
 */
export async function setToken(token) {
    if (typeof window === 'undefined') return

    try {
        const response = await fetch('/api/auth/set-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })

        if (!response.ok) {
            console.error('Failed to set auth cookie')
        }
    } catch (error) {
        console.error('Error setting auth cookie:', error)
    }
}

/**
 * Clear authentication token (logout)
 */
export async function clearToken() {
    if (typeof window === 'undefined') return

    try {
        await fetch('/api/auth/clear-token', {
            method: 'POST',
        })
    } catch (error) {
        console.error('Error clearing auth cookie:', error)
    }
}

/**
 * API Client that routes requests through a proxy to handle auth
 */
export async function apiClient(endpoint, options = {}) {
    const headers = {
        ...options.headers,
    }

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
    }

    try {
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
        const proxyUrl = `/api/proxy/${normalizedEndpoint}`

        const response = await fetch(proxyUrl, {
            ...options,
            headers,
            credentials: 'include',
        })

        if (!response.ok) {
            if (response.status === 401) {
                if (typeof window !== 'undefined') {
                    await clearToken()
                    window.location.href = '/auth/login'
                }
                throw new Error('Session expired. Please login again.')
            }

            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json().catch(() => ({}))
                if (errorData.message && Array.isArray(errorData.message)) {
                    const validationMessages = errorData.message.map((err) => {
                        if (typeof err === 'string') return err
                        return err.constraints ? Object.values(err.constraints).join(', ') : JSON.stringify(err)
                    }).join('; ')
                    throw new Error(`Validation failed: ${validationMessages}`)
                }
                throw new Error(errorData.message || `API request failed with status ${response.status}`)
            } else {
                throw new Error('API endpoint not found. Make sure the backend is running.')
            }
        }

        if (response.status === 204) {
            return null
        }

        return await response.json()
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error(`Fetch error for ${endpoint}:`, error)
        }
        throw error
    }
}
