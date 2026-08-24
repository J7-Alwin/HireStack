/**
 * Centralized Application Environment Configuration
 *
 * Exposes strongly typed, validated environment variables.
 * Only browser-safe public variables prefixed with VITE_ are accessed here.
 */

export interface AppConfig {
  readonly apiBaseUrl: string
  readonly isProduction: boolean
  readonly isDevelopment: boolean
  readonly mode: string
}

function validateEnv(): AppConfig {
  const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

  if (typeof rawApiUrl !== 'string' || rawApiUrl.trim().length === 0) {
    throw new Error(
      '[Config Error] VITE_API_BASE_URL is required but was not provided or is invalid.'
    )
  }

  // Remove trailing slashes for consistent URL concatenation
  const normalizedApiUrl = rawApiUrl.trim().replace(/\/+$/, '')

  return {
    apiBaseUrl: normalizedApiUrl,
    isProduction: Boolean(import.meta.env.PROD),
    isDevelopment: Boolean(import.meta.env.DEV),
    mode: import.meta.env.MODE || 'development',
  }
}

export const env: AppConfig = validateEnv()
