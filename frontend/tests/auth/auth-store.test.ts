import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/auth.store'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('useAuthStore', () => {
  const mockUser: AuthUser = {
    id: 'usr_admin',
    email: 'admin@hirestack.com',
    role: Role.COMPANY_ADMIN,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  beforeEach(() => {
    useAuthStore.getState().reset()
  })

  it('initializes with default state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.status).toBe('INITIALIZING')
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(true)
    expect(state.error).toBeNull()
  })

  it('updates state upon successful authentication', () => {
    useAuthStore.getState().setAuthenticated(mockUser)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.status).toBe('AUTHENTICATED')
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('resets state upon logout/unauthenticated', () => {
    useAuthStore.getState().setAuthenticated(mockUser)
    useAuthStore.getState().setUnauthenticated()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.status).toBe('UNAUTHENTICATED')
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('updates loading and error states properly', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)

    useAuthStore.getState().setError('Authentication failed')
    expect(useAuthStore.getState().error).toBe('Authentication failed')
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})
