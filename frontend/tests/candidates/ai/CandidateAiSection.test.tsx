import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CandidateAiSection } from '@/features/candidates/components/CandidateAiSection'
import * as authModule from '@/features/auth'
import { Role } from '@/types'

describe('CandidateAiSection Component & RBAC', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    vi.restoreAllMocks()
  })

  it('renders all three AI tabs for COMPANY_ADMIN', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'admin@hirestack.com', role: Role.COMPANY_ADMIN },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateAiSection candidateId="cand_1" />
      </QueryClientProvider>
    )

    expect(screen.getByTestId('candidate-ai-section')).toBeInTheDocument()
    expect(screen.getByText('AI Candidate Intelligence')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /ATS Compatibility Score/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Resume Recommendations/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Recruiter AI Insights/i })).toBeInTheDocument()
  })

  it('allows switching between tabs', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u2', email: 'recruiter@hirestack.com', role: Role.RECRUITER },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateAiSection candidateId="cand_1" />
      </QueryClientProvider>
    )

    expect(screen.getByTestId('candidate-ats-score-section')).toBeInTheDocument()

    // Switch to Resume Recommendations tab
    fireEvent.click(screen.getByRole('tab', { name: /Resume Recommendations/i }))
    expect(screen.getByTestId('candidate-resume-recommendations-section')).toBeInTheDocument()

    // Switch to Recruiter AI Insights tab
    fireEvent.click(screen.getByRole('tab', { name: /Recruiter AI Insights/i }))
    expect(screen.getByTestId('candidate-ai-insights-section')).toBeInTheDocument()
  })

  it('does NOT render anything for SUPER_ADMIN', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u3', email: 'super@hirestack.com', role: Role.SUPER_ADMIN },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <CandidateAiSection candidateId="cand_1" />
      </QueryClientProvider>
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('only exposes Resume Recommendations tab for CANDIDATE role', () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: { id: 'u4', email: 'cand@example.com', role: Role.CANDIDATE },
      isAuthenticated: true,
      isLoading: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateAiSection candidateId="cand_1" />
      </QueryClientProvider>
    )

    expect(screen.getByRole('tab', { name: /Resume Recommendations/i })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /ATS Compatibility Score/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /Recruiter AI Insights/i })).not.toBeInTheDocument()
  })
})
