import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobsPage } from '@/features/jobs/pages/JobsPage'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Job } from '@/features/jobs/types/jobs.types'

describe('JobsPage Component', () => {
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
    vi.spyOn(jobsService, 'getDepartmentOptions').mockResolvedValue([])
  })

  const mockJob: Job = {
    id: 'j1',
    companyId: 'comp_1',
    departmentId: 'dept_eng',
    department: { id: 'dept_eng', name: 'Engineering' },
    jobCode: 'JOB-001',
    title: 'Lead DevOps Engineer',
    description: 'Manage cloud infrastructure.',
    employmentType: 'FULL_TIME',
    workplaceType: 'REMOTE',
    openings: 2,
    status: 'OPEN',
    isActive: true,
    createdBy: 'usr_rec',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  }

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/jobs']}>
          <AuthProvider>
            <JobsPage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders jobs list page with header, table, and job row', async () => {
    vi.spyOn(jobsService, 'listJobs').mockResolvedValueOnce({
      data: [mockJob],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })

    renderComponent()

    expect(await screen.findByText('Lead DevOps Engineer')).toBeInTheDocument()
    expect(screen.getByText('Jobs')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Post a Job')).toBeInTheDocument()
  })

  it('renders empty state when no jobs exist', async () => {
    vi.spyOn(jobsService, 'listJobs').mockResolvedValueOnce({
      data: [],
      meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
    })

    renderComponent()

    expect(await screen.findByText('No jobs found')).toBeInTheDocument()
  })
})
