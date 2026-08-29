import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ApplicationAiInsights } from '@/features/applications/components/ApplicationAiInsights'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { Role } from '@/types'
import * as authModule from '@/features/auth'
import { aiService } from '@/features/ai/services/ai.service'

describe('ApplicationAiInsights RBAC Enforcement', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    vi.restoreAllMocks()
    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValue([])
  })

  const renderWithRole = (role: Role) => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@hirestack.io',
        role,
        firstName: 'Test',
        lastName: 'User',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as any)

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ApplicationAiInsights
            candidateId="cand-123"
            jobId="job-456"
            candidateName="Jane Doe"
            jobTitle="Staff Frontend Engineer"
          />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  it('renders section for COMPANY_ADMIN', () => {
    renderWithRole(Role.COMPANY_ADMIN)
    expect(screen.getByTestId('application-ai-insights-section')).toBeInTheDocument()
  })

  it('renders section for RECRUITER', () => {
    renderWithRole(Role.RECRUITER)
    expect(screen.getByTestId('application-ai-insights-section')).toBeInTheDocument()
  })

  it('renders nothing for SUPER_ADMIN', () => {
    renderWithRole(Role.SUPER_ADMIN)
    expect(screen.queryByTestId('application-ai-insights-section')).not.toBeInTheDocument()
  })

  it('renders nothing for CANDIDATE', () => {
    renderWithRole(Role.CANDIDATE)
    expect(screen.queryByTestId('application-ai-insights-section')).not.toBeInTheDocument()
  })
})
