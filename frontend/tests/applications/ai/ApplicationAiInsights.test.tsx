import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApplicationAiInsights } from '@/features/applications/components/ApplicationAiInsights'
import { aiService } from '@/features/ai/services/ai.service'
import * as authModule from '@/features/auth'
import { Role } from '@/types'
import type { AiInsightResponse, AiInsightHistoryItem } from '@/features/ai/types'

const mockInsight: AiInsightResponse = {
  id: 'insight-1',
  candidateId: 'cand-123',
  jobId: 'job-456',
  overallInsight: 'Strong match for the Senior Frontend Engineer role with solid React background.',
  strengths: ['8+ years TypeScript experience', 'Proven system design leadership'],
  weaknesses: ['Limited Kubernetes production exposure'],
  skillGaps: ['GraphQL', 'Kubernetes'],
  experienceConcerns: ['Short tenure at last startup (6 months)'],
  hiringRisks: ['High salary expectation vs budget'],
  hiringConfidence: 88,
  jobFitObservations: ['Demonstrated high alignment with React architecture'],
  recruiterFocusAreas: ['Probe Kubernetes knowledge', 'Clarify startup exit reason'],
  recommendation: 'STRONG_HIRE',
  aiModel: 'gemini-1.5-pro',
  promptVersion: '1.0',
  createdAt: '2026-08-28T10:00:00.000Z',
  updatedAt: '2026-08-28T10:00:00.000Z',
}

const mockHistory: AiInsightHistoryItem[] = [
  {
    id: 'insight-1',
    candidateId: 'cand-123',
    jobId: 'job-456',
    overallInsight: 'Initial insight evaluation',
    hiringConfidence: 88,
    recommendation: 'STRONG_HIRE',
    aiModel: 'gemini-1.5-pro',
    promptVersion: '1.0',
    createdAt: '2026-08-28T10:00:00.000Z',
    updatedAt: '2026-08-28T10:00:00.000Z',
  },
]

describe('ApplicationAiInsights Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
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

  it('renders initial empty state with trigger button before generation', async () => {
    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValue([])

    renderComponent()

    expect(screen.getByTestId('application-ai-insights-section')).toBeInTheDocument()
    expect(
      await screen.findByText(/No Recruiter Insights Generated For This Application/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Generate Recruiter Insights/i })
    ).toBeInTheDocument()
  })

  it('calls aiService.createAiInsights when clicking Generate button and displays results', async () => {
    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValue([])
    const createSpy = vi.spyOn(aiService, 'createAiInsights').mockResolvedValue(mockInsight)

    renderComponent()

    const generateBtn = await screen.findByRole('button', { name: /Generate Recruiter Insights/i })
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        candidateId: 'cand-123',
        jobId: 'job-456',
      })
    })

    expect(await screen.findByTestId('ai-insight-results')).toBeInTheDocument()
    expect(screen.getByText('88%')).toBeInTheDocument()
    expect(screen.getByText(/Strong match for the Senior Frontend Engineer role/i)).toBeInTheDocument()
    expect(screen.getByText('8+ years TypeScript experience')).toBeInTheDocument()
    expect(screen.getByText('High salary expectation vs budget')).toBeInTheDocument()
    expect(screen.getByText('GraphQL')).toBeInTheDocument()
    expect(screen.getByText('Kubernetes')).toBeInTheDocument()
    expect(screen.getByText('Probe Kubernetes knowledge')).toBeInTheDocument()
  })

  it('renders historical evaluations history bar and allows switching active insight', async () => {
    const historicalItem2: AiInsightHistoryItem = {
      id: 'insight-2',
      candidateId: 'cand-123',
      jobId: 'job-456',
      overallInsight: 'Earlier evaluation',
      hiringConfidence: 75,
      recommendation: 'CONSIDER',
      aiModel: 'gemini-1.5-pro',
      promptVersion: '1.0',
      createdAt: '2026-08-20T10:00:00.000Z',
      updatedAt: '2026-08-20T10:00:00.000Z',
    }

    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValue([mockHistory[0], historicalItem2])
    const detailSpy = vi.spyOn(aiService, 'getAiInsight').mockResolvedValue({
      ...mockInsight,
      id: 'insight-2',
      hiringConfidence: 75,
      recommendation: 'CONSIDER',
      overallInsight: 'Earlier evaluation for candidate',
    })

    renderComponent()

    expect(await screen.findByTestId('ai-insights-history-bar')).toBeInTheDocument()
    expect(screen.getByText(/Evaluations History:/i)).toBeInTheDocument()
    const historyBtn = screen.getByText(/CONSIDER • 75%/i)
    expect(historyBtn).toBeInTheDocument()

    fireEvent.click(historyBtn)

    await waitFor(() => {
      expect(detailSpy).toHaveBeenCalledWith('insight-2')
    })
    expect(await screen.findByText('Earlier evaluation for candidate')).toBeInTheDocument()
  })

  it('renders error state with retry when generation fails', async () => {
    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValue([])
    vi.spyOn(aiService, 'createAiInsights').mockRejectedValue(new Error('Rate limit exceeded from AI provider'))

    renderComponent()

    const generateBtn = await screen.findByRole('button', { name: /Generate Recruiter Insights/i })
    fireEvent.click(generateBtn)

    expect(await screen.findByText(/AI Insights Generation Failed/i)).toBeInTheDocument()
    expect(screen.getByText(/Rate limit exceeded from AI provider/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
  })

  it('renders quick navigation links to candidate profile and job opening', async () => {
    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValue(mockHistory)
    vi.spyOn(aiService, 'getAiInsight').mockResolvedValue(mockInsight)

    renderComponent()

    const historyBtn = await screen.findByRole('button', { name: /STRONG_HIRE/i })
    fireEvent.click(historyBtn)

    const candidateLink = await screen.findByRole('link', { name: /Candidate Profile \(Jane Doe\)/i })
    expect(candidateLink).toHaveAttribute('href', '/app/candidates/cand-123')

    const jobLink = screen.getByRole('link', { name: /Job Opening \(Staff Frontend Engineer\)/i })
    expect(jobLink).toHaveAttribute('href', '/app/jobs/job-456')
  })
})
