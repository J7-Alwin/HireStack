import type { ReactNode } from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { Spinner } from '@/components/ui'

export interface PublicRouteProps {
  readonly children?: ReactNode
}


/**
 * Public Route Guard (e.g. for /login)
 *
 * Redirects already-authenticated users to their intended destination or home.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { user, status, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (status === 'INITIALIZING' || (isLoading && !user)) {
    return (
      <div
        data-testid="public-auth-loading-state"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <Spinner size="lg" />
      </div>
    )
  }


  if (isAuthenticated && user) {
    const returnTo = (location.state as { returnTo?: string })?.returnTo || '/'
    return <Navigate to={returnTo} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
