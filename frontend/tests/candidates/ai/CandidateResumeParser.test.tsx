import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CandidatesPage } from '@/features/candidates/pages/CandidatesPage'
import { candidatesService } from '@/features/candidates/services/candidates.service'
import { aiService } from '@/features/ai/services/ai.service'
import * as authModule from '@/features/auth'
import { Role } from '@/types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CandidateResumeParser Integration in CandidatesPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    vi.restoreAllMocks()

    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'recruiter@hirestack.com', role: Role.RECRUITER },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    vi.spyOn(candidatesService, 'listCandidates').mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
    })
  })

  it('renders Import / Parse Resume button on CandidatesPage and opens parser modal on click', () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <CandidatesPage />
        </QueryClientProvider>
      </MemoryRouter>
    )

    const importBtn = screen.getByRole('button', { name: /Import \/ Parse Resume/i })
    expect(importBtn).toBeInTheDocument()

    fireEvent.click(importBtn)

    expect(screen.getByText('Upload & Parse Candidate Resume')).toBeInTheDocument()
    expect(screen.getByLabelText(/Upload PDF resume/i)).toBeInTheDocument()
  })

  it('submits PDF resume in modal and navigates to candidate profile upon creation', async () => {
    vi.spyOn(aiService, 'parseResume').mockResolvedValueOnce({
      id: 'cand_new_123',
      candidateCode: 'CAN-123',
      firstName: 'Selina',
      lastName: 'Kyle',
    } as any)

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <CandidatesPage />
        </QueryClientProvider>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Import \/ Parse Resume/i }))

    const fileInput = screen.getByLabelText(/Upload PDF resume/i)
    const validFile = new File(['%PDF-1.4 sample'], 'selina-resume.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(fileInput, { target: { files: [validFile] } })
    fireEvent.click(screen.getByRole('button', { name: /Parse & Create Candidate/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/app/candidates/cand_new_123')
    })
  })
})
