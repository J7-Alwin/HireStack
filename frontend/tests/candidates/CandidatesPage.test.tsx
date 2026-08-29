import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CandidatesPage } from '@/features/candidates/pages/CandidatesPage'
import { candidatesService } from '@/features/candidates/services/candidates.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Candidate } from '@/features/candidates/types/candidates.types'

describe('CandidatesPage Component', () => {
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

  const mockCandidate: Candidate = {
    id: 'c1',
    companyId: 'comp_1',
    candidateCode: 'CAND-001',
    firstName: 'Grace',
    lastName: 'Hopper',
    email: 'grace@navy.mil',
    phone: '555-0101',
    currentCompany: 'US Navy',
    currentDesignation: 'Rear Admiral',
    experienceYears: 20,
    status: 'ACTIVE',
    isActive: true,
    primaryRecruiterId: 'usr_rec',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  }

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/candidates']}>
          <AuthProvider>
            <CandidatesPage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders candidates list page with header and candidate rows', async () => {
    vi.spyOn(candidatesService, 'listCandidates').mockResolvedValueOnce({
      data: [mockCandidate],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })

    renderComponent()

    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.getByText('Candidates')).toBeInTheDocument()
    expect(screen.getByText('grace@navy.mil')).toBeInTheDocument()
    expect(screen.getByText('Add Candidate')).toBeInTheDocument()
  })

  it('renders empty state when no candidates exist', async () => {
    vi.spyOn(candidatesService, 'listCandidates').mockResolvedValueOnce({
      data: [],
      meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
    })

    renderComponent()

    expect(await screen.findByText('No candidates found')).toBeInTheDocument()
  })
})
