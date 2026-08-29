import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OfferDetailPage } from '@/features/offers/pages/OfferDetailPage'
import { offersService } from '@/features/offers/services/offers.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Offer } from '@/features/offers/types/offers.types'

describe('OfferDetailPage Component', () => {
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
    id: 'off_123',
    offerCode: 'OFF-000001',
    companyId: 'comp_1',
    applicationId: 'app_1',
    candidateId: 'cand_1',
    recruiterId: 'usr_rec',
    version: 1,
    status: 'DRAFT',
    salary: 135000,
    currency: 'USD',
    employmentType: 'FULL_TIME',
    joiningDate: '2026-06-01T00:00:00.000Z',
    expiryDate: '2026-05-15T00:00:00.000Z',
    benefits: 'Comprehensive health, vision, and 401(k)',
    notes: 'Equity refresh after 1 year',
    offerLetterUrl: 'https://storage.company.com/offers/OFF-000001.pdf',
    offerLetterFileName: 'Offer_Letter.pdf',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    application: {
      id: 'app_1',
      applicationCode: 'APP-000001',
      stage: 'OFFER',
      status: 'ACTIVE',
      assignedRecruiterId: 'usr_rec',
      assignedRecruiter: {
        id: 'usr_rec',
        name: 'Recruiter Admin',
        email: 'recruiter@company.com',
      },
      candidate: {
        id: 'cand_1',
        candidateCode: 'CAN-001',
        firstName: 'Wanda',
        lastName: 'Maximoff',
        email: 'wanda@example.com',
        phone: '+1-555-0199',
      },
      job: {
        id: 'job_1',
        jobCode: 'JOB-001',
        title: 'Lead Chaos Engineer',
      },
    },
  }

  const renderComponent = (id = 'off_123') =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/app/offers/${id}`]}>
          <AuthProvider>
            <Routes>
              <Route path="/app/offers/:offerId" element={<OfferDetailPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders offer detail with all sections, relations, and actions', async () => {
    vi.spyOn(offersService, 'getOfferById').mockResolvedValueOnce(mockOffer)

    renderComponent()

    expect(await screen.findByRole('heading', { name: /OFF-000001 — Wanda Maximoff/ })).toBeInTheDocument()
    expect(screen.getByText('Wanda Maximoff')).toBeInTheDocument()
    expect(screen.getByText('wanda@example.com')).toBeInTheDocument()
    expect(screen.getByText('Lead Chaos Engineer')).toBeInTheDocument()
    expect(screen.getByText('Compensation & Terms')).toBeInTheDocument()
    expect(screen.getByText('View Candidate')).toBeInTheDocument()
    expect(screen.getByText('View Job')).toBeInTheDocument()
    expect(screen.getByText('View Application')).toBeInTheDocument()
    expect(screen.getByText('Offer Actions & Lifecycle')).toBeInTheDocument()
  })

  it('renders not found error state when offer does not exist', async () => {
    vi.spyOn(offersService, 'getOfferById').mockRejectedValueOnce(
      new Error('Offer not found')
    )

    renderComponent('non_existent')

    expect(await screen.findByText('Offer Not Found')).toBeInTheDocument()
    expect(screen.getByText('Back to Offers')).toBeInTheDocument()
  })
})
