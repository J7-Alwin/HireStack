/**
 * Token Storage & Lifecycle Management
 *
 * Provides encapsulated, secure storage for access and refresh tokens.
 * Complies with strict security rules: no token logging, no token leaks in error messages.
 */

const ACCESS_TOKEN_KEY = 'hirestack_access_token'
const REFRESH_TOKEN_KEY = 'hirestack_refresh_token'

export interface AuthTokens {
  readonly accessToken: string
  readonly refreshToken: string
}

class AuthTokenStorage {
  private memoryAccessToken: string | null = null
  private memoryRefreshToken: string | null = null

  constructor() {
    this.hydrateFromStorage()
  }

  private hydrateFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.memoryAccessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY)
        this.memoryRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY)
      }
    } catch {
      // Ignore storage access errors in restricted sandbox/iframe environments
    }
  }

  public getAccessToken(): string | null {
    return this.memoryAccessToken
  }

  public getRefreshToken(): string | null {
    return this.memoryRefreshToken
  }

  public setTokens(tokens: AuthTokens): void {
    this.memoryAccessToken = tokens.accessToken
    this.memoryRefreshToken = tokens.refreshToken

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
        window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
      }
    } catch {
      // Memory fallback active
    }
  }

  public setAccessToken(token: string): void {
    this.memoryAccessToken = token
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
      }
    } catch {
      // Memory fallback active
    }
  }

  public clearTokens(): void {
    this.memoryAccessToken = null
    this.memoryRefreshToken = null

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY)
        window.localStorage.removeItem(REFRESH_TOKEN_KEY)
      }
    } catch {
      // Memory fallback active
    }
  }

  public hasTokens(): boolean {
    return Boolean(this.memoryAccessToken || this.memoryRefreshToken)
  }
}

export const authTokenStorage = new AuthTokenStorage()
