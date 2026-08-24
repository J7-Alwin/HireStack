import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ApiClient } from '@/services/api/api-client'
import { ApiError } from '@/services/api/api-error'

describe('ApiClient', () => {
  const originalFetch = globalThis.fetch
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient({ baseUrl: 'http://localhost:5000/api/v1' })
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('builds URLs correctly with query parameters including arrays and booleans', () => {
    const url = client.buildUrl('/candidates', {
      page: 1,
      limit: 20,
      active: true,
      tags: ['react', 'node'],
      emptyVal: null,
    })

    expect(url).toContain('http://localhost:5000/api/v1/candidates?')
    expect(url).toContain('page=1')
    expect(url).toContain('limit=20')
    expect(url).toContain('active=true')
    expect(url).toContain('tags=react&tags=node')
    expect(url).not.toContain('emptyVal')
  })

  it('performs GET request and returns normalized ApiResponse', async () => {
    const mockResponse = {
      success: true,
      message: 'Candidates fetched',
      data: [{ id: '1', name: 'John Doe' }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
        'x-request-id': 'req-12345',
      }),
      json: async () => mockResponse,
    })

    const res = await client.get('/candidates', { params: { page: 1 } })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/candidates?page=1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      })
    )

    expect(res.success).toBe(true)
    expect(res.data).toEqual(mockResponse.data)
  })

  it('performs POST request with JSON serialized body', async () => {
    const mockCreated = {
      success: true,
      message: 'Created',
      data: { id: 'c-1', email: 'applicant@example.com' },
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCreated,
    })

    const payload = { email: 'applicant@example.com' }
    const res = await client.post('/candidates', payload)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/candidates',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      })
    )

    expect(res.data).toEqual(mockCreated.data)
  })

  it('handles PUT, PATCH, DELETE, and HEAD methods', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, message: 'Updated', data: null }),
    })

    await client.put('/candidates/1', { name: 'New Name' })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/candidates/1',
      expect.objectContaining({ method: 'PUT' })
    )

    await client.patch('/candidates/1', { status: 'HIRED' })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/candidates/1',
      expect.objectContaining({ method: 'PATCH' })
    )

    await client.delete('/candidates/1')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/candidates/1',
      expect.objectContaining({ method: 'DELETE' })
    )

    await client.head('/candidates')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/candidates',
      expect.objectContaining({ method: 'HEAD' })
    )
  })

  it('throws ApiError with normalized status, validation errors, and request-id on failure', async () => {
    const errorBody = {
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'email', message: 'Invalid email address' }],
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({
        'content-type': 'application/json',
        'x-request-id': 'req-err-999',
      }),
      json: async () => errorBody,
    })

    try {
      await client.post('/candidates', { email: 'bad-email' })
      expect.fail('Should have thrown ApiError')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      const apiErr = err as ApiError
      expect(apiErr.status).toBe(400)
      expect(apiErr.isValidationError).toBe(true)
      expect(apiErr.message).toBe('Validation failed')
      expect(apiErr.errors).toEqual(errorBody.errors)
      expect(apiErr.requestId).toBe('req-err-999')
    }
  })

  it('attaches token from AuthTokenProvider and handles onUnauthorized callback', async () => {
    const onUnauthorized = vi.fn()
    client.setTokenProvider({
      getAccessToken: () => 'mock-jwt-token-xyz',
      onUnauthorized,
    })

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, message: 'OK', data: {} }),
    })

    await client.get('/me')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token-xyz',
        }),
      })
    )

    // Test 401 unauthorized triggering onUnauthorized callback
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: false, message: 'Token expired' }),
    })

    try {
      await client.get('/protected')
    } catch {
      expect(onUnauthorized).toHaveBeenCalledTimes(1)
    }
  })

  it('handles request cancellation via AbortSignal', async () => {
    const controller = new AbortController()
    controller.abort()

    try {
      await client.get('/slow-resource', { signal: controller.signal })
      expect.fail('Should have thrown aborted error')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      const apiErr = err as ApiError
      expect(apiErr.isAborted).toBe(true)
      expect(apiErr.code).toBe('ABORTED')
    }
  })
})
