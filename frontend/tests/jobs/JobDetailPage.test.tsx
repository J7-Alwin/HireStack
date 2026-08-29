import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobDetailPage } from '@/features/jobs/pages/JobDetailPage'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Job } from '@/features/jobs/types/jobs.types'

describe('JobDetailPage Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAuthStore.getState().reset()
    useAuthStore.getState().setAuthenticated({
      id: 'usr_admin',
      email: 'admin@company.com',
      role: Role.COMPANY_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })
    vi.restoreAllMocks()
  })

  const mockJob: Job = {
    id: 'job_456',
    companyId: 'comp_1',
    departmentId: 'dept_prod',
    department: { id: 'dept_prod', name: 'Product' },
    jobCode: 'JOB-000456',
    title: 'Lead Product Manager',
    description: 'Spearhead product strategy and hiring experience.',
    responsibilities: 'Define roadmaps and lead cross-functional sprints.',
    requirements: '5+ years SaaS product management experience.',
    benefits: 'Unlimited PTO, Equity, Annual learning budget.',
    employmentType: 'FULL_TIME',
    workplaceType: 'HYBRID',
    openings: 1,
    status: 'OPEN',
    isActive: true,
    createdBy: 'usr_admin',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  }

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/jobs/job_456']}>
          <AuthProvider>
            <Routes>
              <Route path="/app/jobs/:jobId" element={<JobDetailPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders job detail header, summary, description, and status action triggers', async () => {
    vi.spyOn(jobsService, 'getJobById').mockResolvedValueOnce(mockJob)

    renderComponent()

    expect(await screen.findByText('Lead Product Manager')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Spearhead product strategy and hiring experience.')).toBeInTheDocument()
    expect(screen.getByText('Define roadmaps and lead cross-functional sprints.')).toBeInTheDocument()
    expect(screen.getByText('5+ years SaaS product management experience.')).toBeInTheDocument()
    expect(screen.getByText('Edit Job')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Pause Job')).toBeInTheDocument()
    expect(screen.getByText('Close Job')).toBeInTheDocument()
  })

  it('handles not-found state on job error', async () => {
    vi.spyOn(jobsService, 'getJobById').mockRejectedValueOnce(new Error('Job not found'))

    renderComponent()

    expect((await screen.findAllByText('Job not found')).length).toBeGreaterThan(0)
  })
})
