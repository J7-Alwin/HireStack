import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiClient, ApiError } from '@/services/api'

describe('ApiClient', () => {
  const mockBaseUrl = 'http://localhost:5000/api/v1'
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient({ baseUrl: mockBaseUrl })
    vi.restoreAllMocks()
  })

  it('performs successful GET request and parses JSON', async () => {
    const mockData = { success: true, data: { status: 'healthy' } }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockData,
    })

    const response = await client.get<{ success: boolean; data: { status: string } }>('/health')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/health',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      })
    )
    expect(response).toEqual(mockData)
  })

  it('correctly appends query parameters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true, data: [] }),
    })

    await client.get('/jobs', {
      params: { page: 1, limit: 10, search: 'engineer' },
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/jobs?page=1&limit=10&search=engineer',
      expect.anything()
    )
  })

  it('throws ApiError with status and message on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({
        message: 'Resource not found',
        errors: [{ message: 'Entity ID does not exist' }],
      }),
    })

    await expect(client.get('/not-found')).rejects.toThrow(ApiError)

    try {
      await client.get('/not-found')
    } catch (err) {
      const apiError = err as ApiError
      expect(apiError.status).toBe(404)
      expect(apiError.isNotFound).toBe(true)
      expect(apiError.message).toBe('Resource not found')
      expect(apiError.errors?.[0].message).toBe('Entity ID does not exist')
    }
  })

  it('attaches auth token when token getter is set', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    })

    client.setTokenGetter(() => 'mock-jwt-token')

    await client.get('/me')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
        }),
      })
    )
  })
})
