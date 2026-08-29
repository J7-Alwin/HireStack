import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CandidateAiSection } from '@/features/candidates/components/CandidateAiSection'
import { JobAiMatching } from '@/features/jobs/components/JobAiMatching'
import { InterviewAiAssistant } from '@/features/interviews/components/InterviewAiAssistant'
import { ApplicationAiInsights } from '@/features/applications/components/ApplicationAiInsights'
import { aiService } from '@/features/ai/services/ai.service'
import * as authModule from '@/features/auth'
import { Role } from '@/types'

describe('Stage 8G: Final AI Capability Audit & Hardening Suite', () => {
  let queryClient: QueryClient
  let createAtsSpy: any
  let createJobMatchingSpy: any
  let createResumeRecSpy: any
  let createInterviewSpy: any
  let createInsightsSpy: any

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.restoreAllMocks()

    // Mock all query methods to return empty array/objects to simulate mount without error
    vi.spyOn(aiService, 'getJobMatches').mockResolvedValue([])
    vi.spyOn(aiService, 'getResumeRecommendationHistory').mockResolvedValue([])
    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValue({
      candidateId: 'cand-123',
      totalGenerations: 0,
      history: [],
    })
    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValue([])

    // Spy on mutation methods to verify they are NEVER called automatically on mount
    createAtsSpy = vi.spyOn(aiService, 'createAtsScore').mockResolvedValue({} as any)
    createJobMatchingSpy = vi.spyOn(aiService, 'createJobMatching').mockResolvedValue({} as any)
    createResumeRecSpy = vi.spyOn(aiService, 'createResumeRecommendations').mockResolvedValue({} as any)
    createInterviewSpy = vi.spyOn(aiService, 'createInterviewAssistant').mockResolvedValue({} as any)
    createInsightsSpy = vi.spyOn(aiService, 'createAiInsights').mockResolvedValue({} as any)
    vi.spyOn(aiService, 'parseResume').mockResolvedValue({} as any)

    // Default to RECRUITER
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
  })

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('Automatic Execution Audit (Phase 5)', () => {
    it('does NOT automatically trigger any AI mutations when mounting CandidateAiSection', () => {
      renderWithProviders(<CandidateAiSection candidateId="cand-123" />)

      expect(createAtsSpy).not.toHaveBeenCalled()
      expect(createResumeRecSpy).not.toHaveBeenCalled()
      expect(createInsightsSpy).not.toHaveBeenCalled()
    })

    it('does NOT automatically trigger AI job matching when mounting JobAiMatching', () => {
      renderWithProviders(
        <JobAiMatching jobId="job-456" />
      )

      expect(createJobMatchingSpy).not.toHaveBeenCalled()
    })

    it('does NOT automatically trigger AI interview assistant when mounting InterviewAiAssistant', () => {
      renderWithProviders(
        <InterviewAiAssistant candidateId="cand-123" candidateName="Jane Doe" />
      )

      expect(createInterviewSpy).not.toHaveBeenCalled()
    })

    it('does NOT automatically trigger AI recruiter insights when mounting ApplicationAiInsights', () => {
      renderWithProviders(
        <ApplicationAiInsights
          candidateId="cand-123"
          jobId="job-456"
          candidateName="Jane Doe"
          jobTitle="Senior Fullstack Engineer"
        />
      )

      expect(createInsightsSpy).not.toHaveBeenCalled()
    })
  })

  describe('AI Trust Model & Advisory Disclaimers (Phase 4)', () => {
    it('renders prominent advisory disclaimer in CandidateAiSection', async () => {
      renderWithProviders(<CandidateAiSection candidateId="cand-123" />)
      const disclaimers = await screen.findAllByTestId('ai-disclaimer')
      expect(disclaimers.length).toBeGreaterThan(0)
    })

    it('renders prominent advisory disclaimer in JobAiMatching', async () => {
      renderWithProviders(
        <JobAiMatching jobId="job-456" />
      )
      expect(await screen.findByTestId('ai-disclaimer')).toBeInTheDocument()
    })

    it('renders prominent advisory disclaimer in InterviewAiAssistant', async () => {
      renderWithProviders(
        <InterviewAiAssistant candidateId="cand-123" candidateName="Jane Doe" />
      )
      expect(await screen.findByTestId('ai-disclaimer')).toBeInTheDocument()
    })

    it('renders prominent advisory disclaimer in ApplicationAiInsights', async () => {
      renderWithProviders(
        <ApplicationAiInsights
          candidateId="cand-123"
          jobId="job-456"
          candidateName="Jane Doe"
          jobTitle="Senior Fullstack Engineer"
        />
      )
      expect(await screen.findByTestId('ai-disclaimer')).toBeInTheDocument()
    })
  })

  describe('RBAC Authorization Boundaries (Phase 6)', () => {
    it('completely hides CandidateAiSection for SUPER_ADMIN', () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({
        user: {
          id: 'admin-1',
          email: 'superadmin@hirestack.io',
          role: Role.SUPER_ADMIN,
          firstName: 'Super',
          lastName: 'Admin',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      } as any)

      renderWithProviders(<CandidateAiSection candidateId="cand-123" />)
      expect(screen.queryByTestId('candidate-ai-section')).not.toBeInTheDocument()
    })

    it('completely hides JobAiMatching for CANDIDATE role', () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({
        user: {
          id: 'cand-1',
          email: 'candidate@hirestack.io',
          role: Role.CANDIDATE,
          firstName: 'Jane',
          lastName: 'Candidate',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      } as any)

      renderWithProviders(
        <JobAiMatching jobId="job-456" />
      )
      expect(screen.queryByTestId('job-ai-matching-card')).not.toBeInTheDocument()
    })

    it('completely hides ApplicationAiInsights for SUPER_ADMIN and CANDIDATE roles', () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({
        user: {
          id: 'admin-1',
          email: 'superadmin@hirestack.io',
          role: Role.SUPER_ADMIN,
          firstName: 'Super',
          lastName: 'Admin',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      } as any)

      const { unmount } = renderWithProviders(
        <ApplicationAiInsights
          candidateId="cand-123"
          jobId="job-456"
          candidateName="Jane Doe"
          jobTitle="Senior Fullstack Engineer"
        />
      )
      expect(screen.queryByTestId('application-ai-insights-section')).not.toBeInTheDocument()
      unmount()

      vi.spyOn(authModule, 'useAuth').mockReturnValue({
        user: {
          id: 'cand-1',
          email: 'candidate@hirestack.io',
          role: Role.CANDIDATE,
          firstName: 'Jane',
          lastName: 'Candidate',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      } as any)

      renderWithProviders(
        <ApplicationAiInsights
          candidateId="cand-123"
          jobId="job-456"
          candidateName="Jane Doe"
          jobTitle="Senior Fullstack Engineer"
        />
      )
      expect(screen.queryByTestId('application-ai-insights-section')).not.toBeInTheDocument()
    })
  })
})
