import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CandidateDashboardPage } from '@/features/dashboard/pages/CandidateDashboardPage'
import { dashboardService } from '@/features/dashboard/services'
import { Role, AccountStatus } from '@/types'

describe('CandidateDashboardPage Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.restoreAllMocks()
  })

  it('renders candidate greeting, profile status, and action button', async () => {
    vi.spyOn(dashboardService, 'getCurrentUser').mockResolvedValueOnce({
      id: 'c1',
      email: 'applicant@gmail.com',
      role: Role.CANDIDATE,
      status: AccountStatus.ACTIVE,
      companyId: null,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateDashboardPage />
      </QueryClientProvider>
    )

    expect(
      await screen.findByText('Welcome to Your Candidate Portal')
    ).toBeInTheDocument()
    expect(screen.getByText('applicant@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('Explore Open Positions')).toBeInTheDocument()
  })
})
