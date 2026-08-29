import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CompanyAdminDashboardPage } from '@/features/dashboard/pages/CompanyAdminDashboardPage'
import { dashboardService } from '@/features/dashboard/services'

describe('CompanyAdminDashboardPage Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.restoreAllMocks()
  })

  it('renders company pipeline KPIs, stage distribution, and recent applications', async () => {
    vi.spyOn(dashboardService, 'getCompanyPipelineMetrics').mockResolvedValueOnce({
      activeCandidates: 28,
      hiredCount: 6,
      rejectedCount: 2,
      withdrawnCount: 1,
      interviewsToday: 4,
      offersPending: 2,
      offersAccepted: 4,
      stageBreakdown: {
        APPLIED: 12,
        SCREENING: 8,
        TECHNICAL_INTERVIEW: 5,
        FINAL_INTERVIEW: 3,
      },
    })

    vi.spyOn(dashboardService, 'getJobs').mockResolvedValueOnce({
      data: [
        {
          id: 'j1',
          title: 'Senior Frontend Engineer',
          status: 'OPEN',
          createdAt: '2026-02-01T00:00:00Z',
        },
      ],
    })

    vi.spyOn(dashboardService, 'getApplications').mockResolvedValueOnce({
      data: [
        {
          id: 'a1',
          applicationCode: 'APP-000001',
          candidateId: 'c1',
          jobId: 'j1',
          stage: 'TECHNICAL_INTERVIEW',
          status: 'ACTIVE',
          createdAt: '2026-02-05T00:00:00Z',
          candidate: {
            id: 'c1',
            firstName: 'Sarah',
            lastName: 'Connor',
            email: 'sarah@skynet.com',
          },
        },
      ],
    })

    vi.spyOn(dashboardService, 'getInterviews').mockResolvedValueOnce({
      data: [],
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CompanyAdminDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('Company Overview')).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument()
    expect(screen.getByText('APP-000001')).toBeInTheDocument()
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument()
  })
})
