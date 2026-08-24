import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api-error'

/**
 * Standard Query Retry Policy for HireStack ATS
 *
 * Prevents retry storms and never retries client-side/auth/validation errors.
 */
export function queryRetryPolicy(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.isAborted) return false
    // Do not retry 4xx errors
    if (error.status >= 400 && error.status < 500) {
      return false
    }
  }

  // Allow up to 2 retries for transient 5xx or network errors
  return failureCount < 2
}

/**
 * Global QueryClient Instance
 *
 * Configured with conservative freshness, sensible caching, and safe retry policies.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: queryRetryPolicy,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: false, // Do not auto-retry mutations to prevent duplicate writes
    },
  },
})
