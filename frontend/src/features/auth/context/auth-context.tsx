import {
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { apiClient, queryClient } from '@/services/api'
import { authService, authTokenStorage } from '@/services/auth'
import { useAuthStore } from '@/stores'
import { ApiError } from '@/services/api/api-error'
import { AuthContext, type AuthContextValue } from './auth-context-base'
import type { LoginRequest } from '@/types'

export type { AuthContextValue } from './auth-context-base'

export interface AuthProviderProps {
  readonly children: ReactNode
}

/**
 * AuthProvider
 *
 * Centralizes the authentication lifecycle, session restoration,
 * token provider integration with ApiClient, 401 handling, and cache invalidation.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    status,
    isAuthenticated,
    isLoading,
    error,
    setAuthenticated,
    setUnauthenticated,
    setLoading,
    setError,
  } = useAuthStore()

  const handleUnauthorized = useCallback(() => {
    authTokenStorage.clearTokens()
    queryClient.clear()
    setUnauthenticated()
  }, [setUnauthenticated])

  // Register token provider with ApiClient on mount
  useEffect(() => {
    apiClient.setTokenProvider({
      getAccessToken: () => authTokenStorage.getAccessToken(),
      onUnauthorized: handleUnauthorized,
    })
  }, [handleUnauthorized])

  const restoreSession = useCallback(async (): Promise<void> => {
    if (!authTokenStorage.hasTokens()) {
      if (useAuthStore.getState().status === 'INITIALIZING') {
        setUnauthenticated()
      }
      return
    }

    setLoading(true)
    try {
      const currentUser = await authService.getCurrentUser()
      setAuthenticated(currentUser)
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        authTokenStorage.clearTokens()
        queryClient.clear()
        setUnauthenticated()
      } else {
        // Network or server outage: keep tokens, surface error without destructive wipe
        setError(err instanceof Error ? err.message : 'Unable to restore session')
      }
    } finally {
      setLoading(false)
    }
  }, [setAuthenticated, setUnauthenticated, setLoading, setError])

  // Restore session once on initial mount
  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        const data = await authService.login(credentials)
        setAuthenticated(data.user)
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Authentication failed'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [setAuthenticated, setLoading, setError]
  )

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      await authService.logout()
    } finally {
      authTokenStorage.clearTokens()
      queryClient.clear()
      setUnauthenticated()
      setLoading(false)
    }
  }, [setUnauthenticated, setLoading])

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      await authService.refreshToken()
      const currentUser = await authService.getCurrentUser()
      setAuthenticated(currentUser)
    } catch (err) {
      handleUnauthorized()
      throw err
    }
  }, [setAuthenticated, handleUnauthorized])

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      refreshSession,
      restoreSession,
    }),
    [
      user,
      status,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      refreshSession,
      restoreSession,
    ]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
