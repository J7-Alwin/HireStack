import { create } from 'zustand'
import type { AuthState, AuthStatus, AuthUser } from '@/types'

export interface AuthActions {
  readonly setAuthenticated: (user: AuthUser) => void
  readonly setUnauthenticated: () => void
  readonly setStatus: (status: AuthStatus) => void
  readonly setLoading: (isLoading: boolean) => void
  readonly setError: (error: string | null) => void
  readonly reset: () => void
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  status: 'INITIALIZING',
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setAuthenticated: (user: AuthUser) =>
    set({
      user,
      status: 'AUTHENTICATED',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    }),

  setUnauthenticated: () =>
    set({
      user: null,
      status: 'UNAUTHENTICATED',
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),

  setStatus: (status: AuthStatus) =>
    set({
      status,
      isAuthenticated: status === 'AUTHENTICATED',
      isLoading: status === 'INITIALIZING',
    }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error, isLoading: false }),

  reset: () => set(initialState),
}))
