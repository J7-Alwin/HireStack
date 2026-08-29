import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ApplicationAiInsights } from '@/features/applications/components/ApplicationAiInsights'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { Role } from '@/types'
import * as authModule from '@/features/auth'
import { aiService } from '@/features/ai/services/ai.service'

describe('ApplicationAiInsights Trust Model & Safety', () => {
  let queryClient: QueryClient
  let createSpy: any

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    vi.restoreAllMocks()

    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: {
        id: 'recruiter-1',
        email: 'recruiter@hirestack.io',
        role: Role.RECRUITER,
        firstName: 'Alex',
        lastName: 'Recruiter',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as any)

    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValue([])
    createSpy = vi.spyOn(aiService, 'createAiInsights').mockResolvedValue({} as any)
  })

  const renderComponent = () => {
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

  it('renders advisory AI disclaimer to ensure human recruiter decision making', async () => {
    renderComponent()

    expect(screen.getByTestId('ai-disclaimer')).toBeInTheDocument()
    expect(
      await screen.findByText(/AI-generated information is provided as decision support/i)
    ).toBeInTheDocument()
  })

  it('does NOT automatically invoke AI generation mutation on mount', () => {
    renderComponent()

    expect(createSpy).not.toHaveBeenCalled()
  })
})
