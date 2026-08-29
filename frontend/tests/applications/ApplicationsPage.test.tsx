import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApplicationsPage } from '@/features/applications/pages/ApplicationsPage'
import { applicationsService } from '@/features/applications/services/applications.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Application } from '@/features/applications/types/applications.types'

describe('ApplicationsPage Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAuthStore.getState().reset()
    useAuthStore.getState().setAuthenticated({
      id: 'usr_rec',
      email: 'recruiter@hirestack.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })
    vi.restoreAllMocks()
  })

  const mockApp: Application = {
    id: 'a1',
    applicationCode: 'APP-000001',
    companyId: 'comp_1',
    candidateId: 'cand_1',
    candidate: {
      id: 'cand_1',
      candidateCode: 'CAN-001',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      status: 'ACTIVE',
    },
    jobId: 'job_1',
    job: {
      id: 'job_1',
      jobCode: 'JOB-001',
      title: 'Principal Software Engineer',
      status: 'OPEN',
    },
    assignedRecruiterId: 'usr_rec',
    stage: 'SCREENING',
    status: 'ACTIVE',
    source: 'REFERRAL',
    appliedAt: '2026-02-01T00:00:00Z',
    createdBy: 'usr_rec',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  }

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/applications']}>
          <AuthProvider>
            <ApplicationsPage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders applications list page with candidate, job, and actions', async () => {
    vi.spyOn(applicationsService, 'listApplications').mockResolvedValueOnce({
      data: [mockApp],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })

    renderComponent()

    expect(await screen.findByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Principal Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Applications')).toBeInTheDocument()
    expect(screen.getByText('New Application')).toBeInTheDocument()
  })

  it('renders empty state when no applications exist', async () => {
    vi.spyOn(applicationsService, 'listApplications').mockResolvedValueOnce({
      data: [],
      meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
    })

    renderComponent()

    expect(await screen.findByText('No applications found')).toBeInTheDocument()
  })
})
