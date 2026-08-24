import type { ApiErrorCode, ApiErrorDetail } from '@/types/errors'

export interface ApiErrorOptions {
  readonly status: number
  readonly message: string
  readonly code?: ApiErrorCode
  readonly errors?: readonly ApiErrorDetail[]
  readonly requestId?: string
  readonly data?: unknown
  readonly isAborted?: boolean
}

/**
 * Standard Normalized Frontend API Error
 *
 * Normalizes HTTP status codes, Zod/backend validation errors, network failures,
 * and AbortController cancellations without exposing sensitive internals.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly errors?: readonly ApiErrorDetail[]
  readonly requestId?: string
  readonly data?: unknown
  readonly isAborted: boolean

  constructor(options: ApiErrorOptions) {
    super(options.message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code || ApiError.resolveErrorCode(options.status, options.isAborted)
    this.errors = options.errors
    this.requestId = options.requestId
    this.data = options.data
    this.isAborted = Boolean(options.isAborted)

    Object.setPrototypeOf(this, ApiError.prototype)
  }

  private static resolveErrorCode(status: number, isAborted?: boolean): ApiErrorCode {
    if (isAborted) return 'ABORTED'
    if (status === 0) return 'NETWORK_ERROR'
    if (status === 400) return 'BAD_REQUEST'
    if (status === 401) return 'UNAUTHORIZED'
    if (status === 403) return 'FORBIDDEN'
    if (status === 404) return 'NOT_FOUND'
    if (status === 409) return 'CONFLICT'
    if (status === 422) return 'VALIDATION_FAILED'
    if (status === 429) return 'RATE_LIMITED'
    if (status === 503) return 'MAINTENANCE_MODE'
    if (status >= 500) return 'INTERNAL_SERVER_ERROR'
    return 'UNKNOWN'
  }

  get isNetworkError(): boolean {
    return this.status === 0 && !this.isAborted
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  get isServerError(): boolean {
    return this.status >= 500
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isConflict(): boolean {
    return this.status === 409
  }

  get isValidationError(): boolean {
    return this.status === 400 || this.status === 422 || Boolean(this.errors && this.errors.length > 0)
  }

  get isRateLimited(): boolean {
    return this.status === 429
  }

  /**
   * Returns a sanitized, UI-safe message for end users.
   */
  public getUserFriendlyMessage(): string {
    if (this.isAborted) {
      return 'Request was cancelled.'
    }
    if (this.isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection.'
    }
    if (this.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }
    if (this.status === 403) {
      return 'You do not have permission to perform this action.'
    }
    if (this.status === 404) {
      return 'The requested resource could not be found.'
    }
    if (this.status === 409) {
      return this.message || 'A conflict occurred with the current state of the resource.'
    }
    if (this.isValidationError) {
      return this.message || 'Please correct the errors in the form.'
    }
    if (this.status === 429) {
      return 'Too many requests. Please wait a moment and try again.'
    }
    if (this.isServerError) {
      return 'An unexpected server error occurred. Please try again later.'
    }
    return this.message || 'An error occurred while processing your request.'
  }

  /**
   * Normalizes unknown thrown errors into an ApiError instance.
   */
  public static from(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return new ApiError({
        status: 0,
        message: 'Request was cancelled',
        code: 'ABORTED',
        isAborted: true,
      })
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new ApiError({
          status: 0,
          message: 'Request was cancelled',
          code: 'ABORTED',
          isAborted: true,
        })
      }
      return new ApiError({
        status: 0,
        message: error.message,
        code: 'NETWORK_ERROR',
      })
    }

    return new ApiError({
      status: 0,
      message: 'An unknown error occurred',
      code: 'UNKNOWN',
    })
  }
}
