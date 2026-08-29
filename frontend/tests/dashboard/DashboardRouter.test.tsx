import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardRouter } from '@/features/dashboard/pages/DashboardRouter'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus, type AuthUser } from '@/types'
import { dashboardService } from '@/features/dashboard/services'

describe('DashboardRouter Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  const renderWithProviders = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <DashboardRouter />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders SuperAdminDashboardPage for SUPER_ADMIN', async () => {
    const superAdmin: AuthUser = {
      id: 'usr_sa',
      email: 'super@hirestack.com',
      role: Role.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: null,
    }
    useAuthStore.getState().setAuthenticated(superAdmin)

    vi.spyOn(dashboardService, 'getCompanies').mockResolvedValue({
      data: [],
      pagination: { total: 0, totalPages: 0, page: 1, limit: 10 },
    })
    vi.spyOn(dashboardService, 'getUsers').mockResolvedValue({
      data: [],
      meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
    })

    renderWithProviders()

    expect(await screen.findByTestId('super-admin-dashboard')).toBeInTheDocument()
    expect(screen.getByText('Platform Overview')).toBeInTheDocument()
  })

  it('renders CompanyAdminDashboardPage for COMPANY_ADMIN', async () => {
    const companyAdmin: AuthUser = {
      id: 'usr_ca',
      email: 'admin@acme.com',
      role: Role.COMPANY_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    }
    useAuthStore.getState().setAuthenticated(companyAdmin)

    vi.spyOn(dashboardService, 'getCompanyPipelineMetrics').mockResolvedValue({
      activeCandidates: 5,
      hiredCount: 1,
      rejectedCount: 0,
      withdrawnCount: 0,
      interviewsToday: 1,
      offersPending: 0,
      offersAccepted: 0,
      stageBreakdown: {},
    })
    vi.spyOn(dashboardService, 'getJobs').mockResolvedValue({ data: [] })
    vi.spyOn(dashboardService, 'getApplications').mockResolvedValue({ data: [] })
    vi.spyOn(dashboardService, 'getInterviews').mockResolvedValue({ data: [] })

    renderWithProviders()

    expect(await screen.findByTestId('company-admin-dashboard')).toBeInTheDocument()
    expect(screen.getByText('Company Overview')).toBeInTheDocument()
  })

  it('renders RecruiterDashboardPage for RECRUITER', async () => {
    const recruiter: AuthUser = {
      id: 'usr_rec',
      email: 'recruiter@acme.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    }
    useAuthStore.getState().setAuthenticated(recruiter)

    vi.spyOn(dashboardService, 'getRecruiterPipelineMetrics').mockResolvedValue({
      activeCandidates: 3,
      hiredCount: 0,
      rejectedCount: 0,
      withdrawnCount: 0,
      interviewsToday: 0,
      offersPending: 0,
      offersAccepted: 0,
      stageBreakdown: {},
    })
    vi.spyOn(dashboardService, 'getApplications').mockResolvedValue({ data: [] })
    vi.spyOn(dashboardService, 'getInterviews').mockResolvedValue({ data: [] })

    renderWithProviders()

    expect(await screen.findByTestId('recruiter-dashboard')).toBeInTheDocument()
    expect(screen.getByText('Recruiting Overview')).toBeInTheDocument()
  })

  it('renders CandidateDashboardPage for CANDIDATE', async () => {
    const candidate: AuthUser = {
      id: 'usr_cand',
      email: 'candidate@gmail.com',
      role: Role.CANDIDATE,
      status: AccountStatus.ACTIVE,
      companyId: null,
    }
    useAuthStore.getState().setAuthenticated(candidate)

    vi.spyOn(dashboardService, 'getCurrentUser').mockResolvedValue(candidate)

    renderWithProviders()

    expect(await screen.findByTestId('candidate-dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome to Your Candidate Portal')).toBeInTheDocument()
  })

  it('renders error state when user is not authenticated', () => {
    renderWithProviders()

    expect(screen.getByText('Authentication required')).toBeInTheDocument()
  })
})
