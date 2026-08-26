import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores'
import { hasAnyRole } from '../rbac/permissions'
import type { Role } from '@/types'

export interface RoleGuardProps {
  readonly roles: readonly Role[]
  readonly children: ReactNode
  readonly fallback?: ReactNode
}

/**
 * Role Guard Component
 *
 * Declaratively renders children only if the currently authenticated user
 * has at least one of the specified roles. Otherwise renders optional fallback.
 */
export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user)

  if (!hasAnyRole(user, roles)) {
    return fallback
  }

  return <>{children}</>
}
