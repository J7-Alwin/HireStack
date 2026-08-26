import { describe, it, expect, beforeEach } from 'vitest'
import { authTokenStorage } from '@/services/auth/auth-token.storage'

describe('AuthTokenStorage', () => {
  beforeEach(() => {
    authTokenStorage.clearTokens()
  })

  it('stores and retrieves access and refresh tokens', () => {
    expect(authTokenStorage.hasTokens()).toBe(false)
    expect(authTokenStorage.getAccessToken()).toBeNull()
    expect(authTokenStorage.getRefreshToken()).toBeNull()

    authTokenStorage.setTokens({
      accessToken: 'access_jwt_123',
      refreshToken: 'refresh_jwt_456',
    })

    expect(authTokenStorage.hasTokens()).toBe(true)
    expect(authTokenStorage.getAccessToken()).toBe('access_jwt_123')
    expect(authTokenStorage.getRefreshToken()).toBe('refresh_jwt_456')
  })

  it('clears stored tokens on request', () => {
    authTokenStorage.setTokens({
      accessToken: 'access_jwt_123',
      refreshToken: 'refresh_jwt_456',
    })

    authTokenStorage.clearTokens()

    expect(authTokenStorage.hasTokens()).toBe(false)
    expect(authTokenStorage.getAccessToken()).toBeNull()
    expect(authTokenStorage.getRefreshToken()).toBeNull()
  })
})
