import { describe, it, expect } from 'vitest'
import { getNavigationForUser } from '@/config/navigation.config'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('Pipeline RBAC & Permissions', () => {
  it('includes hiring pipeline in navigation for COMPANY_ADMIN and RECRUITER, but not SUPER_ADMIN or CANDIDATE', () => {
    const adminUser: AuthUser = {
      id: 'usr_admin',
      email: 'admin@company.com',
      role: Role.COMPANY_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    }

    const recruiterUser: AuthUser = {
      id: 'usr_rec',
      email: 'recruiter@company.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    }

    const superAdminUser: AuthUser = {
      id: 'usr_super',
      email: 'super@hirestack.com',
      role: Role.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: null,
    }

    const candidateUser: AuthUser = {
      id: 'usr_cand',
      email: 'cand@example.com',
      role: Role.CANDIDATE,
      status: AccountStatus.ACTIVE,
      companyId: null,
    }

    const adminNav = getNavigationForUser(adminUser).flatMap((s) => s.items)
    expect(adminNav.some((i) => i.id === 'pipeline')).toBe(true)

    const recruiterNav = getNavigationForUser(recruiterUser).flatMap((s) => s.items)
    expect(recruiterNav.some((i) => i.id === 'pipeline')).toBe(true)

    const superNav = getNavigationForUser(superAdminUser).flatMap((s) => s.items)
    expect(superNav.some((i) => i.id === 'pipeline')).toBe(false)

    const candNav = getNavigationForUser(candidateUser).flatMap((s) => s.items)
    expect(candNav.some((i) => i.id === 'pipeline')).toBe(false)
  })
})
