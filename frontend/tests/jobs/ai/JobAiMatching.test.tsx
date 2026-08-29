import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobAiMatching } from '@/features/jobs/components/JobAiMatching'
import { aiService } from '@/features/ai/services/ai.service'
import * as authModule from '@/features/auth'
import { Role } from '@/types'
import type { JobMatchingResponse, JobMatchHistoryResponse } from '@/features/ai/types'

describe('JobAiMatching Component', () => {
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
  })

  const renderComponent = (jobId = 'job_123') =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <JobAiMatching jobId={jobId} />
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders initial empty state with Generate Matches CTA when no history exists', async () => {
    vi.spyOn(aiService, 'getJobMatches').mockResolvedValueOnce([])

    renderComponent()

    expect(await screen.findByTestId('job-ai-matching-section')).toBeInTheDocument()
    expect(screen.getByText('AI Applicant Matching & Ranking')).toBeInTheDocument()
    expect(screen.getByTestId('job-ai-matching-empty-state')).toBeInTheDocument()
    expect(screen.getByText('No AI Applicant Analysis Generated Yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Generate Applicant Matches/i })).toBeInTheDocument()
  })

  it('explicitly triggers matching mutation on button click and renders loading then results', async () => {
    vi.spyOn(aiService, 'getJobMatches').mockResolvedValueOnce([])

    const mockResponse: JobMatchingResponse = {
      jobId: 'job_123',
      totalCandidates: 2,
      generatedAt: '2026-03-01T10:00:00Z',
      matches: [
        {
          candidateId: 'cand_1',
          candidateName: 'Alice Johnson',
          matchPercentage: 92,
          recommendation: 'STRONGLY_RECOMMENDED',
        },
        {
          candidateId: 'cand_2',
          candidateName: 'Bob Smith',
          matchPercentage: 74,
          recommendation: 'RECOMMENDED',
        },
      ],
    }

    const createJobMatchingSpy = vi
      .spyOn(aiService, 'createJobMatching')
      .mockResolvedValueOnce(mockResponse)

    renderComponent()

    const generateBtn = await screen.findByRole('button', { name: /Generate Applicant Matches/i })
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(createJobMatchingSpy).toHaveBeenCalledWith({ jobId: 'job_123' })
    })

    expect(await screen.findByTestId('job-match-ranking-table')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    expect(screen.getByText('74%')).toBeInTheDocument()
  })

  it('renders historical matching records when available and provides regenerate option', async () => {
    const mockHistory: JobMatchHistoryResponse = [
      {
        id: 'jm_1',
        jobId: 'job_123',
        candidateId: 'cand_1',
        candidateName: 'Alice Johnson',
        matchPercentage: 88,
        recommendation: 'RECOMMENDED',
        createdAt: '2026-02-20T12:00:00Z',
      },
    ]

    vi.spyOn(aiService, 'getJobMatches').mockResolvedValueOnce(mockHistory)

    renderComponent()

    expect(await screen.findByTestId('historical-match-notice')).toBeInTheDocument()
    expect(screen.getByText(/Previous AI applicant matching analysis generated on/i)).toBeInTheDocument()
    expect(screen.getByTestId('job-match-ranking-table')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByTestId('regenerate-matches-button')).toBeInTheDocument()
  })

  it('displays error state with retry on generation failure', async () => {
    vi.spyOn(aiService, 'getJobMatches').mockResolvedValueOnce([])
    vi.spyOn(aiService, 'createJobMatching').mockRejectedValueOnce(
      new Error('AI inference service is temporarily overloaded.')
    )

    renderComponent()

    const generateBtn = await screen.findByRole('button', { name: /Generate Applicant Matches/i })
    fireEvent.click(generateBtn)

    expect(await screen.findByTestId('ai-error-state')).toBeInTheDocument()
    expect(screen.getByText('AI inference service is temporarily overloaded.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry Evaluation/i })).toBeInTheDocument()
  })

  it('handles post-generation empty state when 0 applicants were matched', async () => {
    vi.spyOn(aiService, 'getJobMatches').mockResolvedValueOnce([])
    vi.spyOn(aiService, 'createJobMatching').mockResolvedValueOnce({
      jobId: 'job_123',
      totalCandidates: 0,
      generatedAt: '2026-03-01T10:00:00Z',
      matches: [],
    })

    renderComponent()

    const generateBtn = await screen.findByRole('button', { name: /Generate Applicant Matches/i })
    fireEvent.click(generateBtn)

    expect(await screen.findByTestId('no-applicants-empty-state')).toBeInTheDocument()
    expect(screen.getByText('No Applicants Evaluated')).toBeInTheDocument()
  })
})
