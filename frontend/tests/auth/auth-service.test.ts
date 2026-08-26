import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService, authTokenStorage } from '@/services/auth'
import { apiClient } from '@/services/api'
import { ApiError } from '@/services/api/api-error'
import { Role, AccountStatus, type AuthUser, type LoginResponseData, type RefreshTokenResponseData } from '@/types'

describe('AuthService', () => {
  const mockUser: AuthUser = {
    id: 'usr_123',
    email: 'recruiter@hirestack.com',
    role: Role.RECRUITER,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_456',
  }

  const mockLoginData: LoginResponseData = {
    user: mockUser,
    accessToken: 'mock_access_token_123',
    refreshToken: 'mock_refresh_token_456',
  }

  beforeEach(() => {
    authTokenStorage.clearTokens()
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('successfully authenticates and stores tokens', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        data: mockLoginData,
      })

      const result = await authService.login({
        email: 'recruiter@hirestack.com',
        password: 'Password@123',
      })

      expect(result).toEqual(mockLoginData)
      expect(authTokenStorage.getAccessToken()).toBe('mock_access_token_123')
      expect(authTokenStorage.getRefreshToken()).toBe('mock_refresh_token_456')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'recruiter@hirestack.com',
        password: 'Password@123',
      })
    })

    it('throws ApiError on invalid credentials', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new ApiError({
          status: 401,
          message: 'Invalid email or password',
        })
      )

      await expect(
        authService.login({
          email: 'wrong@hirestack.com',
          password: 'WrongPassword',
        })
      ).rejects.toThrow('Invalid email or password')

      expect(authTokenStorage.hasTokens()).toBe(false)
    })
  })

  describe('logout', () => {
    it('calls logout endpoint with refresh token and clears storage', async () => {
      authTokenStorage.setTokens({
        accessToken: 'access_123',
        refreshToken: 'refresh_456',
      })

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        message: 'Logout successful',
        data: null,
      })

      await authService.logout()

      expect(postSpy).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refresh_456' })
      expect(authTokenStorage.hasTokens()).toBe(false)
      expect(authTokenStorage.getAccessToken()).toBeNull()
      expect(authTokenStorage.getRefreshToken()).toBeNull()
    })

    it('clears storage even if backend logout fails', async () => {
      authTokenStorage.setTokens({
        accessToken: 'access_123',
        refreshToken: 'refresh_456',
      })

      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new ApiError({ status: 500, message: 'Internal server error' })
      )

      await authService.logout()

      expect(authTokenStorage.hasTokens()).toBe(false)
    })
  })

  describe('refreshToken', () => {
    it('rotates access and refresh tokens', async () => {
      authTokenStorage.setTokens({
        accessToken: 'old_access',
        refreshToken: 'old_refresh',
      })

      const mockRefreshData: RefreshTokenResponseData = {
        accessToken: 'new_access',
        refreshToken: 'new_refresh',
      }

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        message: 'Tokens rotated successfully',
        data: mockRefreshData,
      })

      const tokens = await authService.refreshToken()

      expect(tokens.accessToken).toBe('new_access')
      expect(tokens.refreshToken).toBe('new_refresh')
      expect(authTokenStorage.getAccessToken()).toBe('new_access')
      expect(authTokenStorage.getRefreshToken()).toBe('new_refresh')
    })

    it('throws error if no refresh token is stored', async () => {
      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available')
    })
  })

  describe('getCurrentUser', () => {
    it('retrieves user profile from /auth/me', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: mockUser },
      })

      const user = await authService.getCurrentUser()

      expect(user).toEqual(mockUser)
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
    })
  })
})
