import { describe, it, expect } from 'vitest'
import { queryClient, queryRetryPolicy, createEntityQueryKeys, ApiError } from '@/services/api'

describe('React Query Configuration & Query Keys', () => {
  it('configures conservative defaults on QueryClient', () => {
    const defaultQueryOptions = queryClient.getDefaultOptions().queries

    expect(defaultQueryOptions?.staleTime).toBe(1000 * 60 * 2) // 2 mins
    expect(defaultQueryOptions?.gcTime).toBe(1000 * 60 * 10) // 10 mins
    expect(defaultQueryOptions?.refetchOnWindowFocus).toBe(false)
    expect(defaultQueryOptions?.refetchOnReconnect).toBe(true)
  })

  it('rejects retries for 4xx errors and aborted requests in queryRetryPolicy', () => {
    const err400 = new ApiError({ status: 400, message: 'Bad request' })
    expect(queryRetryPolicy(0, err400)).toBe(false)

    const err401 = new ApiError({ status: 401, message: 'Unauthorized' })
    expect(queryRetryPolicy(0, err401)).toBe(false)

    const err403 = new ApiError({ status: 403, message: 'Forbidden' })
    expect(queryRetryPolicy(0, err403)).toBe(false)

    const err404 = new ApiError({ status: 404, message: 'Not found' })
    expect(queryRetryPolicy(0, err404)).toBe(false)

    const err422 = new ApiError({ status: 422, message: 'Validation failed' })
    expect(queryRetryPolicy(0, err422)).toBe(false)

    const errAbort = new ApiError({ status: 0, message: 'Aborted', isAborted: true })
    expect(queryRetryPolicy(0, errAbort)).toBe(false)
  })

  it('allows bounded retry for transient 5xx server errors and network failures', () => {
    const err500 = new ApiError({ status: 500, message: 'Server down' })
    expect(queryRetryPolicy(0, err500)).toBe(true)
    expect(queryRetryPolicy(1, err500)).toBe(true)
    expect(queryRetryPolicy(2, err500)).toBe(false) // Max 2 retries

    const errNet = new ApiError({ status: 0, message: 'Network failed' })
    expect(queryRetryPolicy(0, errNet)).toBe(true)
    expect(queryRetryPolicy(1, errNet)).toBe(true)
    expect(queryRetryPolicy(2, errNet)).toBe(false)
  })

  it('generates predictable, hierarchical query keys with createEntityQueryKeys', () => {
    const candidateKeys = createEntityQueryKeys('candidates')

    expect(candidateKeys.all).toEqual(['candidates'])
    expect(candidateKeys.lists()).toEqual(['candidates', 'list'])
    expect(candidateKeys.list({ page: 1, limit: 10 })).toEqual([
      'candidates',
      'list',
      { page: 1, limit: 10 },
    ])
    expect(candidateKeys.details()).toEqual(['candidates', 'detail'])
    expect(candidateKeys.detail('c-101')).toEqual(['candidates', 'detail', 'c-101'])
    expect(candidateKeys.custom('stats', 'weekly')).toEqual(['candidates', 'stats', 'weekly'])
  })
})
