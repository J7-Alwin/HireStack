import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobAiMatching } from '@/features/jobs/components/JobAiMatching'
import * as authModule from '@/features/auth'
import { Role } from '@/types'

describe('JobAiMatching RBAC Enforcement', () => {
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
          <JobAiMatching jobId="job_999" />
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('permits COMPANY_ADMIN to access AI job matching', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u_admin', email: 'admin@company.com', role: Role.COMPANY_ADMIN },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    renderComponent()

    expect(screen.getByTestId('job-ai-matching-section')).toBeInTheDocument()
    expect(screen.getByText('AI Applicant Matching & Ranking')).toBeInTheDocument()
  })

  it('permits RECRUITER to access AI job matching', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u_recruiter', email: 'recruiter@company.com', role: Role.RECRUITER },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    renderComponent()

    expect(screen.getByTestId('job-ai-matching-section')).toBeInTheDocument()
    expect(screen.getByText('AI Applicant Matching & Ranking')).toBeInTheDocument()
  })

  it('forbids SUPER_ADMIN from accessing company-scoped job matching', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u_super', email: 'super@hirestack.com', role: Role.SUPER_ADMIN },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    const { container } = renderComponent()

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByTestId('job-ai-matching-section')).not.toBeInTheDocument()
  })

  it('forbids CANDIDATE role from accessing recruiter-scoped job matching rankings', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u_candidate', email: 'candidate@example.com', role: Role.CANDIDATE },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    const { container } = renderComponent()

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByTestId('job-ai-matching-section')).not.toBeInTheDocument()
  })
})
