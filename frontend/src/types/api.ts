import type { PaginationMeta } from './pagination'
import type { ApiErrorDetail } from './errors'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

/**
 * Standard Backend API Response Envelope
 * Matches the HireStack ATS backend response contract.
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean
  readonly message: string
  readonly data?: T
  readonly meta?: Record<string, unknown> | PaginationMeta
  readonly errors?: readonly ApiErrorDetail[]
  readonly stack?: string | null
}

/**
 * Paginated API Response Envelope
 */
export interface PaginatedResponse<T> extends ApiResponse<readonly T[]> {
  readonly meta: PaginationMeta
}

/**
 * Request Options for ApiClient
 */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  readonly params?: Record<string, string | number | boolean | readonly (string | number)[] | undefined | null>
  readonly body?: unknown
  readonly timeoutMs?: number
}

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  readonly baseUrl: string
  readonly defaultHeaders?: Record<string, string>
  readonly timeoutMs?: number
}
