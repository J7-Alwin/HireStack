/**
 * Authentication & RBAC Types
 *
 * Source of Truth: Backend Swagger / OpenAPI schemas and shared enums.
 */

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  RECRUITER: 'RECRUITER',
  CANDIDATE: 'CANDIDATE',
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
} as const

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus]

export interface AuthUser {
  readonly id: string
  readonly email: string
  readonly role: Role
  readonly status: AccountStatus
  readonly companyId: string | null
  readonly recruiterId?: string | null
}

export interface LoginRequest {
  readonly email: string
  readonly password: string
}

export interface LoginResponseData {
  readonly user: AuthUser
  readonly accessToken: string
  readonly refreshToken: string
  readonly mustChangePassword?: boolean
}

export interface RefreshTokenRequest {
  readonly refreshToken: string
}

export interface RefreshTokenResponseData {
  readonly accessToken: string
  readonly refreshToken: string
}

export interface CurrentUserResponseData {
  readonly user: AuthUser
}

export interface ForgotPasswordRequest {
  readonly email: string
}

export interface ResetPasswordRequest {
  readonly token: string
  readonly newPassword: string
  readonly confirmPassword: string
}

export interface VerifyEmailRequest {
  readonly token: string
}

export interface ChangePasswordRequest {
  readonly currentPassword: string
  readonly newPassword: string
  readonly confirmPassword: string
}

export type AuthStatus = 'INITIALIZING' | 'AUTHENTICATED' | 'UNAUTHENTICATED'

export interface AuthState {
  readonly user: AuthUser | null
  readonly status: AuthStatus
  readonly isAuthenticated: boolean
  readonly isLoading: boolean
  readonly error: string | null
}
