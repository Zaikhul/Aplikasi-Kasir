import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getToken, clearToken } from '@/lib/apiClient'
import { authApi } from '@/lib/api/auth.api'

const subscribers = new Set<(user: AuthUser | null) => void>()

export interface BusinessInfo {
  businessName?: string
  address?: string
  phone?: string
  taxId?: string
}

export interface SubscriptionInfo {
  plan?: string
  status?: string
  currentPeriodEnd?: string
}

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: string
  businessInfo?: BusinessInfo
  subscription?: SubscriptionInfo
  createdAt?: string
  updatedAt?: string
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
}

let cachedUser: AuthUser | null = null

export function resetAuthCache(nextUser: AuthUser | null = null) {
  cachedUser = nextUser
  subscribers.forEach((listener) => listener(cachedUser))
}

/**
 * Custom hook for authentication state management
 * Validates token by fetching the verified profile
 */
export function useAuth(requireAuth = true) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: Boolean(cachedUser),
    isLoading: !cachedUser,
    user: cachedUser,
  })

  useEffect(() => {
    const listener = (nextUser: AuthUser | null) => {
      setAuthState({
        isAuthenticated: Boolean(nextUser),
        isLoading: false,
        user: nextUser,
      })
    }
    subscribers.add(listener)
    return () => {
      subscribers.delete(listener)
    }
  }, [])

  useEffect(() => {
    const validateAuth = async () => {
      const token = getToken()

      if (!token) {
        if (requireAuth) {
          router.replace('/auth/login')
        }
        resetAuthCache(null)
        return
      }

      if (cachedUser) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: cachedUser,
        })
        return
      }

      try {
        const profile = await authApi.getProfile()
        resetAuthCache(profile)
      } catch (error: any) {
        console.error('Token validation failed:', error)
        clearToken()
        resetAuthCache(null)

        if (requireAuth) {
          router.replace('/auth/login')
        }
      }
    }

    validateAuth()
  }, [router, requireAuth])

  return authState
}

