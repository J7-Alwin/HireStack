import { apiClient } from '@/services/api'
import { authTokenStorage, type AuthTokens } from './auth-token.storage'
import type {
  ApiResponse,
  AuthUser,
  ChangePasswordRequest,
  CurrentUserResponseData,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponseData,
  RefreshTokenRequest,
  RefreshTokenResponseData,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/types'

/**
 * Authentication Service
 *
 * Dedicated HTTP service adhering strictly to backend Swagger / OpenAPI auth endpoints.
 * Never calls fetch directly; delegates to ApiClient.
 */
export class AuthService {
  /**
   * Authenticate user with email and password
   * Endpoint: POST /auth/login
   */
  public async login(credentials: LoginRequest): Promise<LoginResponseData> {
    const response = await apiClient.post<LoginResponseData>('/auth/login', credentials)
    const data = response.data

    if (!data) {
      throw new Error('Invalid response from authentication server')
    }

    if (data.accessToken && data.refreshToken) {
      authTokenStorage.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
    }

    return data
  }

  /**
   * Invalidate session and revoke refresh token
   * Endpoint: POST /auth/logout
   */
  public async logout(): Promise<void> {
    const refreshToken = authTokenStorage.getRefreshToken()

    try {
      if (refreshToken) {
        const body: RefreshTokenRequest = { refreshToken }
        await apiClient.post<null>('/auth/logout', body)
      }
    } catch {
      // Proceed with client cleanup even if backend is unreachable or token expired
    } finally {
      authTokenStorage.clearTokens()
    }
  }

  /**
   * Rotate access and refresh tokens
   * Endpoint: POST /auth/refresh-token
   */
  public async refreshToken(): Promise<AuthTokens> {
    const refreshToken = authTokenStorage.getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const body: RefreshTokenRequest = { refreshToken }
    const response = await apiClient.post<RefreshTokenResponseData>('/auth/refresh-token', body)
    const data = response.data

    if (!data) {
      throw new Error('Invalid response from token refresh endpoint')
    }

    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }

    authTokenStorage.setTokens(tokens)
    return tokens
  }

  /**
   * Retrieve currently authenticated user profile
   * Endpoint: GET /auth/me
   */
  public async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<CurrentUserResponseData>('/auth/me')
    if (!response.data?.user) {
      throw new Error('Failed to retrieve user profile')
    }
    return response.data.user
  }


  /**
   * Change current user's password
   * Endpoint: POST /auth/change-password
   */
  public async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/change-password', data)
  }

  /**
   * Request password reset link
   * Endpoint: POST /auth/forgot-password
   */
  public async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/forgot-password', data)
  }

  /**
   * Reset password with reset token
   * Endpoint: POST /auth/reset-password
   */
  public async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/reset-password', data)
  }

  /**
   * Verify email address with verification token
   * Endpoint: POST /auth/verify-email
   */
  public async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/verify-email', data)
  }

  /**
   * Resend verification email to authenticated user
   * Endpoint: POST /auth/resend-verification
   */
  public async resendVerification(): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/resend-verification')
  }
}

export const authService = new AuthService()
