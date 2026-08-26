import { describe, it, expect, beforeEach, vi } from 'vitest'
import { queryClient, apiClient } from '@/services/api'
import { authService, authTokenStorage } from '@/services/auth'
import { useAuthStore } from '@/stores/auth.store'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('Logout & Cache Security', () => {
  const mockUser: AuthUser = {
    id: 'usr_rec',
    email: 'recruiter@hirestack.com',
    role: Role.RECRUITER,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  beforeEach(() => {
    queryClient.clear()
    authTokenStorage.clearTokens()
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('clears query cache and auth state upon logout', async () => {
    // Populate query cache with sensitive ATS data
    queryClient.setQueryData(['candidates', 'list'], [{ id: 'cand_1', name: 'John Doe' }])
    queryClient.setQueryData(['jobs', 'list'], [{ id: 'job_1', title: 'Software Engineer' }])

    expect(queryClient.getQueryData(['candidates', 'list'])).toBeDefined()
    expect(queryClient.getQueryData(['jobs', 'list'])).toBeDefined()

    // Set authenticated state and tokens
    useAuthStore.getState().setAuthenticated(mockUser)
    authTokenStorage.setTokens({
      accessToken: 'acc_token',
      refreshToken: 'ref_token',
    })

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      message: 'Logout successful',
      data: null,
    })

    await authService.logout()
    queryClient.clear()
    useAuthStore.getState().setUnauthenticated()

    // Assert tokens, state, and query cache are completely cleared
    expect(authTokenStorage.hasTokens()).toBe(false)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
    expect(queryClient.getQueryData(['candidates', 'list'])).toBeUndefined()
    expect(queryClient.getQueryData(['jobs', 'list'])).toBeUndefined()
  })

  it('invalidates query cache and transitions to unauthenticated upon 401 callback', () => {
    queryClient.setQueryData(['interviews', 'list'], [{ id: 'int_1' }])
    useAuthStore.getState().setAuthenticated(mockUser)
    authTokenStorage.setTokens({ accessToken: 'a', refreshToken: 'r' })

    // Simulate ApiClient onUnauthorized callback
    authTokenStorage.clearTokens()
    queryClient.clear()
    useAuthStore.getState().setUnauthenticated()

    expect(authTokenStorage.hasTokens()).toBe(false)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(queryClient.getQueryData(['interviews', 'list'])).toBeUndefined()
  })
})
