import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InterviewTable } from '@/features/interviews/components/InterviewTable'
import { getNavigationForUser } from '@/config/navigation.config'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus, type AuthUser } from '@/types'
import type { Interview } from '@/features/interviews/types/interviews.types'

describe('Interview RBAC & Permissions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  const mockInterview: Interview = {
    id: 'int_1',
    interviewCode: 'INT-000001',
    companyId: 'comp_1',
    applicationId: 'app_1',
    interviewType: 'INTERNAL',
    round: 'TECHNICAL',
    status: 'SCHEDULED',
    outcome: null,
    mode: 'ONLINE',
    scheduledDate: '2026-03-01T00:00:00.000Z',
    startTime: '2026-03-01T10:00:00.000Z',
    endTime: '2026-03-01T11:00:00.000Z',
    timeZone: 'Asia/Kolkata',
    meetingLink: 'https://meet.google.com/test',
    location: null,
    notes: null,
    resultNotes: null,
    cancellationReason: null,
    createdBy: 'usr_rec',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    application: {
      id: 'app_1',
      applicationCode: 'APP-001',
      stage: 'TECHNICAL_INTERVIEW',
      status: 'ACTIVE',
      candidate: {
        id: 'cand_1',
        firstName: 'Arthur',
        lastName: 'Dent',
        email: 'arthur@galaxy.com',
      },
      job: {
        id: 'job_1',
        title: 'Navigator',
      },
    },
    interviewers: [],
  }

  it('renders delete action for COMPANY_ADMIN', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_admin',
      email: 'admin@company.com',
      role: Role.COMPANY_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })

    const onDelete = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <InterviewTable
              interviews={[mockInterview]}
              onView={vi.fn()}
              onEdit={vi.fn()}
              onDelete={onDelete}
            />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByLabelText('Delete interview INT-000001')).toBeInTheDocument()
  })

  it('hides delete action for RECRUITER', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_rec',
      email: 'recruiter@company.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })

    const onDelete = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <InterviewTable
              interviews={[mockInterview]}
              onView={vi.fn()}
              onEdit={vi.fn()}
              onDelete={onDelete}
            />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.queryByLabelText('Delete interview INT-000001')).not.toBeInTheDocument()
  })

  it('includes interviews in navigation for COMPANY_ADMIN and RECRUITER, but not SUPER_ADMIN or CANDIDATE workspace nav', () => {
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
    expect(adminNav.some((i) => i.id === 'interviews')).toBe(true)

    const recruiterNav = getNavigationForUser(recruiterUser).flatMap((s) => s.items)
    expect(recruiterNav.some((i) => i.id === 'interviews')).toBe(true)

    const superNav = getNavigationForUser(superAdminUser).flatMap((s) => s.items)
    expect(superNav.some((i) => i.id === 'interviews')).toBe(false)

    const candNav = getNavigationForUser(candidateUser).flatMap((s) => s.items)
    expect(candNav.some((i) => i.id === 'interviews')).toBe(false)
  })
})
