import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SuperAdminDashboardPage } from '@/features/dashboard/pages/SuperAdminDashboardPage'
import { dashboardService } from '@/features/dashboard/services'

describe('SuperAdminDashboardPage Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.restoreAllMocks()
  })

  it('renders platform metrics and recent tables on success', async () => {
    vi.spyOn(dashboardService, 'getCompanies').mockResolvedValueOnce({
      data: [
        {
          id: 'c1',
          name: 'Tech Innovators',
          status: 'ACTIVE',
          isVerified: true,
          industry: 'Software',
          createdAt: '2026-01-10T00:00:00Z',
        },
      ],
      pagination: { total: 10, totalPages: 1, page: 1, limit: 10 },
    })

    vi.spyOn(dashboardService, 'getUsers').mockResolvedValueOnce({
      data: [
        {
          id: 'u1',
          email: 'admin@techinnovators.com',
          role: 'COMPANY_ADMIN' as any,
          status: 'ACTIVE' as any,
          createdAt: '2026-01-10T00:00:00Z',
        },
      ],
      meta: { total: 25, totalPages: 3, page: 1, limit: 10 },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <SuperAdminDashboardPage />
      </QueryClientProvider>
    )

    expect(await screen.findByTestId('super-admin-dashboard', {}, { timeout: 10000 })).toBeInTheDocument()
    expect(screen.getByText('Platform Overview')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Tech Innovators')).toBeInTheDocument()
    expect(screen.getByText('admin@techinnovators.com')).toBeInTheDocument()
  })

  it('renders ErrorState when API calls fail', async () => {
    vi.spyOn(dashboardService, 'getCompanies').mockRejectedValueOnce(
      new Error('Internal network failure')
    )
    vi.spyOn(dashboardService, 'getUsers').mockResolvedValueOnce({
      data: [],
      meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <SuperAdminDashboardPage />
      </QueryClientProvider>
    )

    expect(
      await screen.findByText('Failed to load platform dashboard', {}, { timeout: 10000 })
    ).toBeInTheDocument()
    expect(screen.getByText('Internal network failure')).toBeInTheDocument()
  })

})
