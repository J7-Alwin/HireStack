import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RecruiterDashboardPage } from '@/features/dashboard/pages/RecruiterDashboardPage'
import { dashboardService } from '@/features/dashboard/services'

describe('RecruiterDashboardPage Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.restoreAllMocks()
  })

  it('renders recruiter pipeline metrics and scheduled interviews', async () => {
    vi.spyOn(dashboardService, 'getRecruiterPipelineMetrics').mockResolvedValueOnce({
      activeCandidates: 14,
      hiredCount: 3,
      rejectedCount: 1,
      withdrawnCount: 0,
      interviewsToday: 2,
      offersPending: 1,
      offersAccepted: 2,
      stageBreakdown: { SCREENING: 6, TECHNICAL_INTERVIEW: 8 },
    })

    vi.spyOn(dashboardService, 'getApplications').mockResolvedValueOnce({
      data: [],
    })

    vi.spyOn(dashboardService, 'getInterviews').mockResolvedValueOnce({
      data: [
        {
          id: 'int_1',
          interviewType: 'TECHNICAL',
          round: 'Technical Round 1',
          status: 'SCHEDULED',
          scheduledDate: '2026-03-10T14:00:00Z',
        },
      ],
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecruiterDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('Recruiting Overview')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByText('Technical Round 1')).toBeInTheDocument()
  })
})
