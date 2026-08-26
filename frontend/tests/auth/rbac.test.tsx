import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  hasRole,
  hasAnyRole,
  canAccess,
  isSuperAdmin,
  isCompanyAdmin,
  isRecruiter,
  isCandidate,
  isCompanyStaff,
} from '@/features/auth/rbac/permissions'
import { RoleGuard } from '@/features/auth/components/RoleGuard'
import { useAuthStore } from '@/stores/auth.store'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('RBAC Permissions & RoleGuard', () => {
  const superAdminUser: AuthUser = {
    id: 'usr_super',
    email: 'super@hirestack.com',
    role: Role.SUPER_ADMIN,
    status: AccountStatus.ACTIVE,
    companyId: null,
  }

  const recruiterUser: AuthUser = {
    id: 'usr_rec',
    email: 'rec@hirestack.com',
    role: Role.RECRUITER,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  const candidateUser: AuthUser = {
    id: 'usr_cand',
    email: 'cand@hirestack.com',
    role: Role.CANDIDATE,
    status: AccountStatus.ACTIVE,
    companyId: null,
  }

  beforeEach(() => {
    useAuthStore.getState().reset()
  })

  describe('Permission functions', () => {
    it('evaluates hasRole correctly', () => {
      expect(hasRole(superAdminUser, Role.SUPER_ADMIN)).toBe(true)
      expect(hasRole(superAdminUser, Role.RECRUITER)).toBe(false)
      expect(hasRole(null, Role.SUPER_ADMIN)).toBe(false)
    })

    it('evaluates hasAnyRole correctly', () => {
      expect(hasAnyRole(recruiterUser, [Role.COMPANY_ADMIN, Role.RECRUITER])).toBe(true)
      expect(hasAnyRole(candidateUser, [Role.COMPANY_ADMIN, Role.RECRUITER])).toBe(false)
      expect(hasAnyRole(null, [Role.CANDIDATE])).toBe(false)
    })

    it('evaluates canAccess correctly', () => {
      expect(canAccess(recruiterUser)).toBe(true)
      expect(canAccess(null)).toBe(false)
      expect(canAccess(recruiterUser, [Role.RECRUITER])).toBe(true)
      expect(canAccess(recruiterUser, [Role.SUPER_ADMIN])).toBe(false)
    })

    it('evaluates role helper functions', () => {
      expect(isSuperAdmin(superAdminUser)).toBe(true)
      expect(isSuperAdmin(recruiterUser)).toBe(false)

      expect(isRecruiter(recruiterUser)).toBe(true)
      expect(isRecruiter(candidateUser)).toBe(false)

      expect(isCandidate(candidateUser)).toBe(true)
      expect(isCandidate(superAdminUser)).toBe(false)

      expect(isCompanyStaff(recruiterUser)).toBe(true)
      expect(isCompanyStaff(candidateUser)).toBe(false)
      expect(isCompanyAdmin(superAdminUser)).toBe(false)
    })
  })

  describe('RoleGuard Component', () => {
    it('renders children when authenticated user has allowed role', () => {
      useAuthStore.getState().setAuthenticated(recruiterUser)

      render(
        <RoleGuard roles={[Role.RECRUITER, Role.COMPANY_ADMIN]}>
          <div data-testid="protected-content">Recruiter Area</div>
        </RoleGuard>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('renders fallback when user does not have allowed role', () => {
      useAuthStore.getState().setAuthenticated(candidateUser)

      render(
        <RoleGuard
          roles={[Role.RECRUITER]}
          fallback={<div data-testid="fallback-content">Denied</div>}
        >
          <div data-testid="protected-content">Recruiter Area</div>
        </RoleGuard>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('fallback-content')).toBeInTheDocument()
    })
  })
})
