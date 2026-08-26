import type { ReactNode } from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { canAccess } from '@/features/auth/rbac/permissions'
import { ForbiddenPage } from './ForbiddenPage'
import { Spinner } from '@/components/ui'
import type { Role } from '@/types'

export interface ProtectedRouteProps {
  readonly allowedRoles?: readonly Role[]
  readonly children?: ReactNode
}

/**
 * Protected Route Guard
 *
 * Enforces authentication and role-based authorization:
 * 1. Waiting for auth initialization -> renders loading state without premature redirects.
 * 2. Unauthenticated user -> redirects to /login with returnTo location.
 * 3. Authenticated user lacking required role -> renders ForbiddenPage (403).
 * 4. Authorized user -> renders protected content.
 */
export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, status, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Prevent premature redirection while authentication is initializing
  if (status === 'INITIALIZING' || (isLoading && !user)) {
    return (
      <div
        data-testid="auth-loading-state"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--color-background)',
          gap: '16px',
        }}
      >
        <Spinner size="lg" />
        <p
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          Authenticating...
        </p>
      </div>
    )
  }


  // If unauthenticated, redirect to login with intended destination
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ returnTo: location.pathname + location.search }} replace />
  }

  // If role authorization is required and user lacks role, render 403 Forbidden
  if (allowedRoles && allowedRoles.length > 0 && !canAccess(user, allowedRoles)) {
    return <ForbiddenPage />
  }

  return children ? <>{children}</> : <Outlet />
}
