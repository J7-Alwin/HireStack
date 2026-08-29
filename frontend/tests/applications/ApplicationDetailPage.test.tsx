import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApplicationDetailPage } from '@/features/applications/pages/ApplicationDetailPage'
import { applicationsService } from '@/features/applications/services/applications.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Application } from '@/features/applications/types/applications.types'

describe('ApplicationDetailPage Component', () => {
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

  const mockApp: Application = {
    id: 'app_789',
    applicationCode: 'APP-000789',
    companyId: 'comp_1',
    candidateId: 'cand_1',
    candidate: {
      id: 'cand_1',
      candidateCode: 'CAN-001',
      firstName: 'Bob',
      lastName: 'Marley',
      email: 'bob@example.com',
      phone: '+1 555 0199',
      status: 'ACTIVE',
    },
    jobId: 'job_1',
    job: {
      id: 'job_1',
      jobCode: 'JOB-001',
      title: 'DevOps Architect',
      status: 'OPEN',
    },
    assignedRecruiterId: 'usr_admin',
    stage: 'APPLIED',
    status: 'ACTIVE',
    source: 'LINKEDIN',
    remarks: 'Strong candidate with extensive Kubernetes background.',
    appliedAt: '2026-02-01T00:00:00Z',
    createdBy: 'usr_admin',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  }

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/applications/app_789']}>
          <AuthProvider>
            <Routes>
              <Route path="/app/applications/:applicationId" element={<ApplicationDetailPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders application details, candidate card, job card, and workflow actions', async () => {
    vi.spyOn(applicationsService, 'getApplicationById').mockResolvedValueOnce(mockApp)

    renderComponent()

    expect(await screen.findByText('Bob Marley')).toBeInTheDocument()
    expect(screen.getByText('DevOps Architect')).toBeInTheDocument()
    expect(screen.getByText(/Strong candidate with extensive Kubernetes background/i)).toBeInTheDocument()
    expect(screen.getByText('Move to Screening')).toBeInTheDocument()
    expect(screen.getByText('Reject')).toBeInTheDocument()
    expect(screen.getByText('Withdraw')).toBeInTheDocument()
    expect(screen.getByText('Edit Notes')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('opens reject modal when clicking Reject', async () => {
    vi.spyOn(applicationsService, 'getApplicationById').mockResolvedValueOnce(mockApp)

    renderComponent()

    const rejectBtn = await screen.findByText('Reject')
    fireEvent.click(rejectBtn)

    expect(screen.getByText('Confirm Rejection')).toBeInTheDocument()
  })
})
