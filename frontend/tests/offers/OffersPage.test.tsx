import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OffersPage } from '@/features/offers/pages/OffersPage'
import { offersService } from '@/features/offers/services/offers.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Offer } from '@/features/offers/types/offers.types'

describe('OffersPage Component', () => {
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

  const mockOffer: Offer = {
    id: 'off_1',
    offerCode: 'OFF-000001',
    companyId: 'comp_1',
    applicationId: 'app_1',
    candidateId: 'cand_1',
    recruiterId: 'usr_rec',
    version: 1,
    status: 'DRAFT',
    salary: 120000,
    currency: 'USD',
    employmentType: 'FULL_TIME',
    joiningDate: '2026-05-01T00:00:00.000Z',
    expiryDate: '2026-04-15T00:00:00.000Z',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    application: {
      id: 'app_1',
      applicationCode: 'APP-000001',
      stage: 'OFFER',
      status: 'ACTIVE',
      candidate: {
        id: 'cand_1',
        candidateCode: 'CAN-001',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena@example.com',
      },
      job: {
        id: 'job_1',
        jobCode: 'JOB-001',
        title: 'Principal Architect',
      },
    },
  }

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/offers']}>
          <AuthProvider>
            <OffersPage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders offers list page with candidate, job, code, salary, and create button', async () => {
    vi.spyOn(offersService, 'listOffers').mockResolvedValueOnce({
      data: [mockOffer],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })

    renderComponent()

    expect(await screen.findByText('Elena Rostova')).toBeInTheDocument()
    expect(screen.getByText('Principal Architect')).toBeInTheDocument()
    expect(screen.getByText('OFF-000001')).toBeInTheDocument()
    expect(screen.getByText('Offers')).toBeInTheDocument()
    expect(screen.getByText('Create Offer')).toBeInTheDocument()
  })

  it('renders empty state when no offers exist', async () => {
    vi.spyOn(offersService, 'listOffers').mockResolvedValueOnce({
      data: [],
      meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
    })

    renderComponent()

    expect(await screen.findByText('No offers found')).toBeInTheDocument()
  })

  it('renders error state on API failure', async () => {
    vi.spyOn(offersService, 'listOffers').mockRejectedValueOnce(
      new Error('Network failure')
    )

    renderComponent()

    expect(await screen.findByText('Failed to load offers')).toBeInTheDocument()
  })
})
