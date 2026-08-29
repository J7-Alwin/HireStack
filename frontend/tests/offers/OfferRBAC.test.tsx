import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OfferTable } from '@/features/offers/components/OfferTable'
import { OfferActions } from '@/features/offers/components/OfferActions'
import { getNavigationForUser } from '@/config/navigation.config'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus, type AuthUser } from '@/types'
import type { Offer } from '@/features/offers/types/offers.types'

describe('Offer RBAC & Permissions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAuthStore.getState().reset()
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
    salary: 100000,
    currency: 'USD',
    employmentType: 'FULL_TIME',
    joiningDate: '2026-06-01T00:00:00.000Z',
    expiryDate: '2026-05-15T00:00:00.000Z',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    application: {
      id: 'app_1',
      applicationCode: 'APP-001',
      stage: 'OFFER',
      status: 'ACTIVE',
      candidate: {
        id: 'cand_1',
        firstName: 'Steve',
        lastName: 'Rogers',
        email: 'steve@shield.gov',
      },
      job: {
        id: 'job_1',
        title: 'Tactical Team Lead',
      },
    },
  }

  it('renders delete action for COMPANY_ADMIN in OfferTable', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_admin',
      email: 'admin@company.com',
      role: Role.COMPANY_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })

    const onDelete = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <OfferTable
              offers={[mockOffer]}
              onView={vi.fn()}
              onEdit={vi.fn()}
              onDelete={onDelete}
            />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByLabelText('Delete offer OFF-000001')).toBeInTheDocument()
  })

  it('hides delete action for RECRUITER in OfferTable', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_rec',
      email: 'recruiter@company.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })

    const onDelete = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <OfferTable
              offers={[mockOffer]}
              onView={vi.fn()}
              onEdit={vi.fn()}
              onDelete={onDelete}
            />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.queryByLabelText('Delete offer OFF-000001')).not.toBeInTheDocument()
  })

  it('allows approve action only for COMPANY_ADMIN in PENDING_APPROVAL status', () => {
    const pendingOffer: Offer = {
      ...mockOffer,
      status: 'PENDING_APPROVAL',
    }

    useAuthStore.getState().setAuthenticated({
      id: 'usr_admin',
      email: 'admin@company.com',
      role: Role.COMPANY_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <OfferActions offer={pendingOffer} />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByRole('button', { name: 'Approve Offer' })).toBeInTheDocument()
    unmount()

    useAuthStore.getState().setAuthenticated({
      id: 'usr_rec',
      email: 'recruiter@company.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <OfferActions offer={pendingOffer} />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.queryByRole('button', { name: 'Approve Offer' })).not.toBeInTheDocument()
    expect(screen.getByText(/Waiting for Company Administrator approval/)).toBeInTheDocument()
  })

  it('includes offers in navigation for COMPANY_ADMIN and RECRUITER, but not SUPER_ADMIN or CANDIDATE workspace nav', () => {
    const adminUser: AuthUser = {
      id: 'usr_admin',
      email: 'admin@company.com',
      role: Role.COMPANY_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    }

    const recruiterUser: AuthUser = {
      id: 'usr_rec',
      email: 'recruiter@company.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    }

    const superAdminUser: AuthUser = {
      id: 'usr_super',
      email: 'super@hirestack.com',
      role: Role.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: null,
    }

    const candidateUser: AuthUser = {
      id: 'usr_cand',
      email: 'cand@example.com',
      role: Role.CANDIDATE,
      status: AccountStatus.ACTIVE,
      companyId: null,
    }

    const adminNav = getNavigationForUser(adminUser).flatMap((s) => s.items)
    expect(adminNav.some((i) => i.id === 'offers')).toBe(true)

    const recruiterNav = getNavigationForUser(recruiterUser).flatMap((s) => s.items)
    expect(recruiterNav.some((i) => i.id === 'offers')).toBe(true)

    const superNav = getNavigationForUser(superAdminUser).flatMap((s) => s.items)
    expect(superNav.some((i) => i.id === 'offers')).toBe(false)

    const candNav = getNavigationForUser(candidateUser).flatMap((s) => s.items)
    expect(candNav.some((i) => i.id === 'offers')).toBe(false)
  })
})
