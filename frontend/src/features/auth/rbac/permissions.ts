import { type AuthUser, Role } from '@/types'

/**
 * Checks if the user has a specific role.
 */
export function hasRole(user: AuthUser | null, role: Role): boolean {
  if (!user) return false
  return user.role === role
}

/**
 * Checks if the user has any of the specified roles.
 */
export function hasAnyRole(user: AuthUser | null, roles: readonly Role[]): boolean {
  if (!user || roles.length === 0) return false
  return roles.includes(user.role)
}

/**
 * Determines whether a user can access a resource protected by allowed roles.
 * If allowedRoles is empty or undefined, any authenticated user is granted access.
 */
export function canAccess(user: AuthUser | null, allowedRoles?: readonly Role[]): boolean {
  if (!user) return false
  if (!allowedRoles || allowedRoles.length === 0) return true
  return hasAnyRole(user, allowedRoles)
}

/**
 * Platform super administrator check
 */
export function isSuperAdmin(user: AuthUser | null): boolean {
  return hasRole(user, Role.SUPER_ADMIN)
}

/**
 * Company administrator check
 */
export function isCompanyAdmin(user: AuthUser | null): boolean {
  return hasRole(user, Role.COMPANY_ADMIN)
}

/**
 * Recruiter role check
 */
export function isRecruiter(user: AuthUser | null): boolean {
  return hasRole(user, Role.RECRUITER)
}

/**
 * Candidate role check
 */
export function isCandidate(user: AuthUser | null): boolean {
  return hasRole(user, Role.CANDIDATE)
}

/**
 * Company staff (Company Admin or Recruiter)
 */
export function isCompanyStaff(user: AuthUser | null): boolean {
  return hasAnyRole(user, [Role.COMPANY_ADMIN, Role.RECRUITER])
}
