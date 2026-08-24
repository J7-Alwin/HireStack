import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/app/error-boundary/ErrorBoundary'

export interface AppProvidersProps {
  readonly children: ReactNode
}

/**
 * Central Application Providers
 *
 * Wraps the application in fundamental providers (ErrorBoundary, and in future stages:
 * QueryProvider, AuthProvider, ThemeProvider, ToastProvider).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
