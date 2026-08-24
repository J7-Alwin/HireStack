import { describe, it, expect } from 'vitest'
import { ApiError } from '@/services/api'

describe('ApiError Class & Normalization', () => {
  it('correctly categorizes status codes into flags and error codes', () => {
    const err400 = new ApiError({ status: 400, message: 'Invalid payload' })
    expect(err400.isClientError).toBe(true)
    expect(err400.isValidationError).toBe(true)
    expect(err400.code).toBe('BAD_REQUEST')

    const err401 = new ApiError({ status: 401, message: 'Unauthorized' })
    expect(err401.isUnauthorized).toBe(true)
    expect(err401.code).toBe('UNAUTHORIZED')

    const err403 = new ApiError({ status: 403, message: 'Forbidden' })
    expect(err403.isForbidden).toBe(true)
    expect(err403.code).toBe('FORBIDDEN')

    const err404 = new ApiError({ status: 404, message: 'Candidate not found' })
    expect(err404.isNotFound).toBe(true)
    expect(err404.code).toBe('NOT_FOUND')

    const err409 = new ApiError({ status: 409, message: 'Email already in use' })
    expect(err409.isConflict).toBe(true)
    expect(err409.code).toBe('CONFLICT')

    const err429 = new ApiError({ status: 429, message: 'Rate limit exceeded' })
    expect(err429.isRateLimited).toBe(true)
    expect(err429.code).toBe('RATE_LIMITED')

    const err500 = new ApiError({ status: 500, message: 'Internal Server Error' })
    expect(err500.isServerError).toBe(true)
    expect(err500.code).toBe('INTERNAL_SERVER_ERROR')

    const errNetwork = new ApiError({ status: 0, message: 'Failed to fetch' })
    expect(errNetwork.isNetworkError).toBe(true)
    expect(errNetwork.code).toBe('NETWORK_ERROR')

    const errAbort = new ApiError({ status: 0, message: 'Aborted', isAborted: true })
    expect(errAbort.isAborted).toBe(true)
    expect(errAbort.isNetworkError).toBe(false)
    expect(errAbort.code).toBe('ABORTED')
  })

  it('produces safe user-friendly messages', () => {
    const errNetwork = new ApiError({ status: 0, message: 'TypeError: failed to fetch' })
    expect(errNetwork.getUserFriendlyMessage()).toContain('internet connection')

    const err401 = new ApiError({ status: 401, message: 'jwt expired' })
    expect(err401.getUserFriendlyMessage()).toContain('session has expired')

    const err403 = new ApiError({ status: 403, message: 'Forbidden' })
    expect(err403.getUserFriendlyMessage()).toContain('permission')

    const err500 = new ApiError({ status: 500, message: 'Database connection failed at /var/run/pg.sock' })
    expect(err500.getUserFriendlyMessage()).toBe('An unexpected server error occurred. Please try again later.')
  })

  it('normalizes various error types via ApiError.from()', () => {
    const domAbort = new DOMException('The operation was aborted.', 'AbortError')
    const normalizedAbort = ApiError.from(domAbort)
    expect(normalizedAbort.isAborted).toBe(true)
    expect(normalizedAbort.code).toBe('ABORTED')

    const regularError = new Error('Socket closed')
    const normalizedNetwork = ApiError.from(regularError)
    expect(normalizedNetwork.isNetworkError).toBe(true)
    expect(normalizedNetwork.message).toBe('Socket closed')

    const existingApiError = new ApiError({ status: 404, message: 'Not found' })
    expect(ApiError.from(existingApiError)).toBe(existingApiError)

    const unknownError = ApiError.from('Random string')
    expect(unknownError.code).toBe('UNKNOWN')
  })
})
