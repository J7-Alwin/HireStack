import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/app/error-boundary/ErrorBoundary'
import { ToastProvider } from '@/components/ui/toast'

export interface AppProvidersProps {
  readonly children: ReactNode
}

/**
 * Central Application Providers
 *
 * Wraps the application in fundamental providers (ErrorBoundary, ToastProvider,
 * and in future stages: QueryProvider, AuthProvider, etc.).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>{children}</ToastProvider>
    </ErrorBoundary>
  )
}
