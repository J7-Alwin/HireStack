import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from '@/app/error-boundary/ErrorBoundary'
import { ToastProvider } from '@/components/ui/toast'
import { queryClient } from '@/services/api'
import { AuthProvider } from '@/features/auth'

export interface AppProvidersProps {
  readonly children: ReactNode
}

/**
 * Central Application Providers
 *
 * Provider hierarchy:
 * ErrorBoundary
 *   └── QueryClientProvider
 *         └── AuthProvider
 *               └── ToastProvider
 *                     └── [children]
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

