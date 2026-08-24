import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from '@/app/error-boundary/ErrorBoundary'
import { ToastProvider } from '@/components/ui/toast'
import { queryClient } from '@/services/api'

export interface AppProvidersProps {
  readonly children: ReactNode
}

/**
 * Central Application Providers
 *
 * Provider hierarchy:
 * ErrorBoundary
 *   └── QueryClientProvider
 *         └── ToastProvider
 *               └── [children]
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
