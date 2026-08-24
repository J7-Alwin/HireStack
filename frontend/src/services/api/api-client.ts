import { env } from '@/config/env'
import { ApiError } from './api-error'
import type {
  ApiClientConfig,
  ApiErrorDetail,
  ApiResponse,
  HttpMethod,
  RequestOptions,
} from '@/types'

/**
 * Authentication Token Provider Interface
 * Allows Stage 4 authentication layer to inject tokens without coupling Stage 3 to auth business logic.
 */
export interface AuthTokenProvider {
  getAccessToken: () => string | null | Promise<string | null>
  onUnauthorized?: () => void
}

/**
 * Centralized API Client
 *
 * Primary HTTP gateway for the HireStack frontend application.
 * Manages URL composition, header injection, JSON parsing, error normalization,
 * AbortSignal request cancellation, and authentication token attachment.
 */
export class ApiClient {
  private readonly baseUrl: string
  private readonly defaultHeaders: Record<string, string>
  private readonly defaultTimeoutMs: number
  private tokenProvider?: AuthTokenProvider

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '')
    this.defaultTimeoutMs = config.timeoutMs || 30000
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.defaultHeaders,
    }
  }

  /**
   * Registers a token provider for authentication integration.
   */
  public setTokenProvider(provider: AuthTokenProvider): void {
    this.tokenProvider = provider
  }

  /**
   * Builds normalized URL with query parameters.
   */
  public buildUrl(
    path: string,
    params?: RequestOptions['params']
  ): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const fullUrl = `${this.baseUrl}${cleanPath}`

    if (!params || Object.keys(params).length === 0) {
      return fullUrl
    }

    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        continue
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== null) {
            searchParams.append(key, String(item))
          }
        }
      } else {
        searchParams.append(key, String(value))
      }
    }

    const queryString = searchParams.toString()
    return queryString ? `${fullUrl}?${queryString}` : fullUrl
  }

  /**
   * Main request handler with AbortSignal and timeout support.
   */
  public async request<T = unknown>(
    path: string,
    options: RequestOptions & { readonly method?: HttpMethod } = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      params,
      body,
      headers,
      signal: externalSignal,
      timeoutMs = this.defaultTimeoutMs,
      ...restOptions
    } = options

    const url = this.buildUrl(path, params)

    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...(headers as Record<string, string> | undefined),
    }

    // Attach Bearer Token if available
    if (this.tokenProvider) {
      try {
        const token = await this.tokenProvider.getAccessToken()
        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`
        }
      } catch {
        // Silently continue if token resolution fails; backend will return 401 if required
      }
    }

    let payload: BodyInit | undefined
    if (body !== undefined && body !== null) {
      if (
        body instanceof FormData ||
        typeof body === 'string' ||
        body instanceof Blob ||
        body instanceof ArrayBuffer
      ) {
        payload = body
        // Let the browser set the boundary for FormData
        if (body instanceof FormData) {
          delete requestHeaders['Content-Type']
        }
      } else {
        payload = JSON.stringify(body)
      }
    }

    // Set up timeout controller combined with external signal
    const timeoutController = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        timeoutController.abort(new Error(`Request timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    }

    let effectiveSignal = timeoutController.signal
    if (externalSignal) {
      if (externalSignal.aborted) {
        if (timeoutId) clearTimeout(timeoutId)
        throw ApiError.from(externalSignal.reason || new DOMException('Aborted', 'AbortError'))
      }

      // Chain external abort to controller
      externalSignal.addEventListener('abort', () => {
        timeoutController.abort(externalSignal.reason)
      })
      effectiveSignal = timeoutController.signal
    }

    try {
      const response = await fetch(url, {
        ...restOptions,
        method,
        headers: requestHeaders,
        body: payload,
        signal: effectiveSignal,
      })

      if (timeoutId) clearTimeout(timeoutId)

      const requestId = response.headers.get('x-request-id') || undefined
      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')

      let parsedData: unknown
      if (response.status === 204) {
        parsedData = null
      } else if (isJson) {
        parsedData = await response.json()
      } else {
        parsedData = await response.text()
      }

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`
        let errorsList: ApiErrorDetail[] | undefined
        let responseData: unknown = parsedData

        if (typeof parsedData === 'object' && parsedData !== null) {
          const resp = parsedData as Record<string, unknown>
          if (typeof resp.message === 'string' && resp.message.trim().length > 0) {
            errorMessage = resp.message
          }
          if (Array.isArray(resp.errors)) {
            errorsList = resp.errors as ApiErrorDetail[]
          }
          if ('data' in resp) {
            responseData = resp.data
          }
        }

        if (response.status === 401 && this.tokenProvider?.onUnauthorized) {
          this.tokenProvider.onUnauthorized()
        }

        throw new ApiError({
          status: response.status,
          message: errorMessage,
          errors: errorsList,
          requestId,
          data: responseData,
        })
      }

      // If backend returns standard ApiResponse envelope
      if (
        typeof parsedData === 'object' &&
        parsedData !== null &&
        'success' in parsedData &&
        typeof (parsedData as Record<string, unknown>).success === 'boolean'
      ) {
        return parsedData as ApiResponse<T>
      }

      // Wrap direct payloads into normalized ApiResponse envelope
      return {
        success: true,
        message: 'Success',
        data: parsedData as T,
      }
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId)
      throw ApiError.from(error)
    }
  }

  public get<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  public post<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  public put<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PUT', body })
  }

  public patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PATCH', body })
  }

  public delete<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }

  public head(path: string, options?: RequestOptions): Promise<ApiResponse<null>> {
    return this.request<null>(path, { ...options, method: 'HEAD' })
  }
}

export const apiClient = new ApiClient({
  baseUrl: env.apiBaseUrl,
})
