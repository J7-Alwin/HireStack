import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InterviewAiAssistant } from '@/features/interviews/components/InterviewAiAssistant'
import * as authModule from '@/features/auth'
import { Role } from '@/types'

describe('InterviewAiAssistant RBAC Enforcement', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    vi.restoreAllMocks()
  })

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <InterviewAiAssistant
            candidateId="cand_999"
            jobId="job_888"
            candidateName="Bob Smith"
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('permits COMPANY_ADMIN to access AI interview assistant', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u_admin', email: 'admin@company.com', role: Role.COMPANY_ADMIN },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    renderComponent()

    expect(screen.getByTestId('interview-ai-assistant-section')).toBeInTheDocument()
    expect(screen.getByText('AI Interview Assistant')).toBeInTheDocument()
  })

  it('permits RECRUITER to access AI interview assistant', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u_recruiter', email: 'recruiter@company.com', role: Role.RECRUITER },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    renderComponent()

    expect(screen.getByTestId('interview-ai-assistant-section')).toBeInTheDocument()
    expect(screen.getByText('AI Interview Assistant')).toBeInTheDocument()
  })

  it('forbids SUPER_ADMIN from accessing company-scoped interview assistant', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u_super', email: 'super@hirestack.com', role: Role.SUPER_ADMIN },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    const { container } = renderComponent()

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByTestId('interview-ai-assistant-section')).not.toBeInTheDocument()
  })

  it('forbids CANDIDATE role from accessing recruiter interview assistant tools', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u_candidate', email: 'candidate@example.com', role: Role.CANDIDATE },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    const { container } = renderComponent()

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByTestId('interview-ai-assistant-section')).not.toBeInTheDocument()
  })
})
