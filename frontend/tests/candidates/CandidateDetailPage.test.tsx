import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CandidateDetailPage } from '@/features/candidates/pages/CandidateDetailPage'
import { candidatesService } from '@/features/candidates/services/candidates.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Candidate } from '@/features/candidates/types/candidates.types'

describe('CandidateDetailPage Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAuthStore.getState().reset()
    useAuthStore.getState().setAuthenticated({
      id: 'usr_admin',
      email: 'admin@company.com',
      role: Role.COMPANY_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })
    vi.restoreAllMocks()
  })

  const mockCandidate: Candidate = {
    id: 'cand_456',
    companyId: 'comp_1',
    candidateCode: 'CAND-000456',
    firstName: 'Alan',
    lastName: 'Turing',
    email: 'alan@bletchley.ac.uk',
    phone: '+44 1908 123456',
    city: 'London',
    country: 'United Kingdom',
    currentCompany: 'Government Code and Cypher School',
    currentDesignation: 'Lead Cryptanalyst',
    experienceYears: 8,
    status: 'ACTIVE',
    isActive: true,
    primaryRecruiterId: 'usr_admin',
    primaryRecruiter: {
      id: 'usr_admin',
      name: 'Joan Clarke',
      email: 'joan@bletchley.ac.uk',
    },
    notes: [
      {
        id: 'n1',
        candidateId: 'cand_456',
        authorId: 'usr_admin',
        author: { id: 'usr_admin', name: 'Joan Clarke' },
        content: 'Exceptional problem solving capability.',
        createdAt: '2026-02-05T00:00:00Z',
      },
    ],
    tags: [
      {
        candidateId: 'cand_456',
        tagId: 't1',
        tag: { id: 't1', name: 'cryptography' },
      },
    ],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  }

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/candidates/cand_456']}>
          <AuthProvider>
            <Routes>
              <Route path="/app/candidates/:candidateId" element={<CandidateDetailPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders candidate detail header, summary, notes, and tags', async () => {
    vi.spyOn(candidatesService, 'getCandidateById').mockResolvedValueOnce(mockCandidate)

    renderComponent()

    expect(await screen.findByText('Alan Turing')).toBeInTheDocument()
    expect(screen.getByText('alan@bletchley.ac.uk')).toBeInTheDocument()
    expect(screen.getByText('Exceptional problem solving capability.')).toBeInTheDocument()
    expect(screen.getByText('cryptography')).toBeInTheDocument()
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('handles not-found state on candidate error', async () => {
    vi.spyOn(candidatesService, 'getCandidateById').mockRejectedValueOnce(new Error('Candidate not found'))

    renderComponent()

    expect((await screen.findAllByText('Candidate not found')).length).toBeGreaterThan(0)
  })
})
