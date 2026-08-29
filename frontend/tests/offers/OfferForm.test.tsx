import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OfferForm } from '@/features/offers/components/OfferForm'
import { applicationsService } from '@/features/applications/services/applications.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Application } from '@/features/applications/types/applications.types'

describe('OfferForm Component', () => {
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
    vi.spyOn(applicationsService, 'listApplications').mockResolvedValue({
      data: [mockApp],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })
  })

  const mockApp: Application = {
    id: 'app_1',
    applicationCode: 'APP-000001',
    companyId: 'comp_1',
    candidateId: 'cand_1',
    candidate: {
      id: 'cand_1',
      candidateCode: 'CAN-001',
      firstName: 'Peter',
      lastName: 'Parker',
      email: 'peter@dailybugle.com',
      status: 'ACTIVE',
    },
    jobId: 'job_1',
    job: {
      id: 'job_1',
      jobCode: 'JOB-001',
      title: 'Photojournalist & Web Developer',
      status: 'OPEN',
    },
    assignedRecruiterId: 'usr_rec',
    stage: 'OFFER',
    status: 'ACTIVE',
    source: 'REFERRAL',
    appliedAt: '2026-02-01T00:00:00Z',
    createdBy: 'usr_rec',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  }

  it('renders create offer form with application selection and compensation inputs', async () => {
    const handleSubmit = vi.fn()
    const handleCancel = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <OfferForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('Application Target')).toBeInTheDocument()
    expect(screen.getByText('Compensation & Terms')).toBeInTheDocument()
    expect(screen.getByText('Offer Schedule & Dates')).toBeInTheDocument()
    expect(screen.getByText('Benefits & Documentation')).toBeInTheDocument()
    expect(await screen.findByText(/APP-000001 — Peter Parker/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Offer Draft' })).toBeInTheDocument()
  })

  it('submits correctly when valid data is entered', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    const handleCancel = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <OfferForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await screen.findByText(/APP-000001 — Peter Parker/)

    fireEvent.change(screen.getByLabelText(/Application/i), { target: { value: 'app_1' } })
    fireEvent.change(screen.getByLabelText(/Annual\/Base Salary/i), { target: { value: '110000' } })
    fireEvent.change(screen.getByLabelText(/Offer Expiry Date/i), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getByLabelText(/Proposed Joining Date/i), { target: { value: '2026-10-01' } })
    fireEvent.change(screen.getByLabelText(/Benefits & Perks/i), {
      target: { value: 'Health insurance and flexible PTO' },
    })

    const submitBtn = screen.getByRole('button', { name: 'Create Offer Draft' })
    fireEvent.click(submitBtn)

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: 'app_1',
        salary: 110000,
        currency: 'USD',
        benefits: 'Health insurance and flexible PTO',
      })
    )
  })

  it('renders edit mode with initial values', async () => {
    const handleSubmit = vi.fn()
    const handleCancel = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <OfferForm
              initialValues={{
                id: 'off_1',
                offerCode: 'OFF-000001',
                salary: 115000,
                currency: 'USD',
                employmentType: 'FULL_TIME',
                joiningDate: '2026-10-01T00:00:00.000Z',
                expiryDate: '2026-09-01T00:00:00.000Z',
              }}
              isEdit={true}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Offer Context')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })
})
