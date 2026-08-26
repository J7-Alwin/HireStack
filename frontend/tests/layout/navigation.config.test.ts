import { describe, it, expect } from 'vitest'
import { getNavigationForUser } from '@/config/navigation.config'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('navigation.config', () => {
  const superAdminUser: AuthUser = {
    id: 'usr_1',
    email: 'super@hirestack.com',
    role: Role.SUPER_ADMIN,
    status: AccountStatus.ACTIVE,
    companyId: null,
  }

  const companyAdminUser: AuthUser = {
    id: 'usr_2',
    email: 'admin@company.com',
    role: Role.COMPANY_ADMIN,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  const recruiterUser: AuthUser = {
    id: 'usr_3',
    email: 'recruiter@company.com',
    role: Role.RECRUITER,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  const candidateUser: AuthUser = {
    id: 'usr_4',
    email: 'candidate@gmail.com',
    role: Role.CANDIDATE,
    status: AccountStatus.ACTIVE,
    companyId: null,
  }

  it('returns empty array when user is null', () => {
    expect(getNavigationForUser(null)).toEqual([])
  })

  it('returns platform & system navigation for SUPER_ADMIN', () => {
    const sections = getNavigationForUser(superAdminUser)
    expect(sections.map((s) => s.id)).toEqual(['platform', 'system'])

    const allItems = sections.flatMap((s) => s.items)
    expect(allItems.some((i) => i.id === 'overview')).toBe(true)
    expect(allItems.some((i) => i.id === 'companies')).toBe(true)
    expect(allItems.some((i) => i.id === 'system-settings')).toBe(true)
    expect(allItems.some((i) => i.id === 'team')).toBe(false)
  })

  it('returns workspace & administration navigation for COMPANY_ADMIN', () => {
    const sections = getNavigationForUser(companyAdminUser)
    expect(sections.map((s) => s.id)).toEqual(['main', 'admin'])

    const allItems = sections.flatMap((s) => s.items)
    expect(allItems.some((i) => i.id === 'overview')).toBe(true)
    expect(allItems.some((i) => i.id === 'candidates')).toBe(true)
    expect(allItems.some((i) => i.id === 'jobs')).toBe(true)
    expect(allItems.some((i) => i.id === 'team')).toBe(true)
    expect(allItems.some((i) => i.id === 'company-settings')).toBe(true)
    expect(allItems.some((i) => i.id === 'companies')).toBe(false)
  })

  it('returns workspace only for RECRUITER (omits admin section)', () => {
    const sections = getNavigationForUser(recruiterUser)
    expect(sections.map((s) => s.id)).toEqual(['main'])

    const allItems = sections.flatMap((s) => s.items)
    expect(allItems.some((i) => i.id === 'candidates')).toBe(true)
    expect(allItems.some((i) => i.id === 'jobs')).toBe(true)
    expect(allItems.some((i) => i.id === 'team')).toBe(false)
    expect(allItems.some((i) => i.id === 'company-settings')).toBe(false)
  })

  it('returns candidate portal navigation for CANDIDATE', () => {
    const sections = getNavigationForUser(candidateUser)
    expect(sections.map((s) => s.id)).toEqual(['candidate'])

    const allItems = sections.flatMap((s) => s.items)
    expect(allItems.some((i) => i.id === 'my-applications')).toBe(true)
    expect(allItems.some((i) => i.id === 'my-interviews')).toBe(true)
    expect(allItems.some((i) => i.id === 'profile')).toBe(true)
    expect(allItems.some((i) => i.id === 'candidates')).toBe(false)
  })
})
