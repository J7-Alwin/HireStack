import { createContext, useContext } from 'react'
import type { AuthStatus, AuthUser, LoginRequest } from '@/types'

export interface AuthContextValue {
  readonly user: AuthUser | null
  readonly status: AuthStatus
  readonly isAuthenticated: boolean
  readonly isLoading: boolean
  readonly error: string | null
  readonly login: (credentials: LoginRequest) => Promise<void>
  readonly logout: () => Promise<void>
  readonly refreshSession: () => Promise<void>
  readonly restoreSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Hook to consume AuthContext
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
