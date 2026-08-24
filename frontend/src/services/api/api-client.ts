import { env } from '@/config/env'

export interface ApiResponse<T = unknown> {
  readonly success: boolean
  readonly message?: string
  readonly data: T
  readonly timestamp?: string
}

export interface ApiErrorDetail {
  readonly field?: string
  readonly message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly errors?: readonly ApiErrorDetail[]
  readonly data?: unknown

  constructor(
    message: string,
    status: number,
    errors?: readonly ApiErrorDetail[],
    data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.data = data
    Object.setPrototypeOf(this, ApiError.prototype)
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
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  readonly params?: Record<string, string | number | boolean | undefined | null>
  readonly body?: unknown
}

export interface ApiClientConfig {
  readonly baseUrl: string
  readonly defaultHeaders?: Record<string, string>
}

/**
 * Centralized API Client
 *
 * Handles HTTP requests, URL composition, header injection, JSON parsing,
 * and error normalization. Business logic must not be placed here.
 */
export class ApiClient {
  private readonly baseUrl: string
  private readonly defaultHeaders: Record<string, string>
  private getAuthToken?: () => string | null | Promise<string | null>

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '')
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.defaultHeaders,
    }
  }

  /**
   * Set dynamic token getter for future authentication integration
   */
  public setTokenGetter(getter: () => string | null | Promise<string | null>): void {
    this.getAuthToken = getter
  }

  private buildUrl(path: string, params?: RequestOptions['params']): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const fullUrl = `${this.baseUrl}${cleanPath}`

    if (!params) {
      return fullUrl
    }

    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    }

    const queryString = searchParams.toString()
    return queryString ? `${fullUrl}?${queryString}` : fullUrl
  }

  public async request<T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, body, headers, ...restOptions } = options
    const url = this.buildUrl(path, params)

    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...(headers as Record<string, string> | undefined),
    }

    if (this.getAuthToken) {
      const token = await this.getAuthToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    let payload: BodyInit | undefined
    if (body !== undefined) {
      if (body instanceof FormData || typeof body === 'string' || body instanceof Blob) {
        payload = body
        // Let the browser set the boundary for FormData
        if (body instanceof FormData) {
          delete requestHeaders['Content-Type']
        }
      } else {
        payload = JSON.stringify(body)
      }
    }

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        body: payload,
      })

      const isJson = response.headers.get('content-type')?.includes('application/json')
      const data = isJson ? await response.json() : await response.text()

      if (!response.ok) {
        const errorMessage =
          (typeof data === 'object' && data !== null && 'message' in data && typeof (data as { message: unknown }).message === 'string')
            ? (data as { message: string }).message
            : `Request failed with status ${response.status}`

        const errors =
          typeof data === 'object' && data !== null && 'errors' in data && Array.isArray((data as { errors: unknown }).errors)
            ? ((data as { errors: ApiErrorDetail[] }).errors)
            : undefined

        throw new ApiError(errorMessage, response.status, errors, data)
      }

      return data as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      const message = error instanceof Error ? error.message : 'Network request failed'
      throw new ApiError(message, 0)
    }
  }

  public get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  public post<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  public put<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body })
  }

  public patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body })
  }

  public delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient({
  baseUrl: env.apiBaseUrl,
})
