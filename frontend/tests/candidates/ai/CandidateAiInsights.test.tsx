import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CandidateAiInsights } from '@/features/candidates/components/CandidateAiInsights'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { aiService } from '@/features/ai/services/ai.service'
import type { AiInsightResponse } from '@/features/ai/types'

describe('CandidateAiInsights Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    vi.restoreAllMocks()

    vi.spyOn(jobsService, 'listJobs').mockResolvedValue({
      data: [
        {
          id: 'job_1',
          title: 'Engineering Director',
          jobCode: 'JOB-003',
        } as any,
      ],
      meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
    })

    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValue([
      {
        id: 'ins_hist_1',
        candidateId: 'cand_1',
        jobId: 'job_1',
        overallInsight: 'Historical insight overview',
        hiringConfidence: 82,
        recommendation: 'SHORTLIST',
        aiModel: 'llama3.2',
        promptVersion: '1.0.0',
        createdAt: '2026-02-10T00:00:00Z',
        updatedAt: '2026-02-10T00:00:00Z',
      },
    ])
  })

  it('renders initial state with requisition selector and history quick picks', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CandidateAiInsights candidateId="cand_1" />
      </QueryClientProvider>
    )

    expect(screen.getByTestId('ai-insights-empty-state')).toBeInTheDocument()
    expect(screen.getByText('No Recruiter Insights Generated Yet')).toBeInTheDocument()

    // History button
    expect(await screen.findByText(/Confidence: 82%/)).toBeInTheDocument()
  })

  it('generates recruiter insights when job is selected and button is clicked', async () => {
    const mockInsight: AiInsightResponse = {
      id: 'ins_1',
      candidateId: 'cand_1',
      jobId: 'job_1',
      overallInsight: 'Demonstrated excellence in org-scale transformation.',
      strengths: ['Org Design', 'Executive Alignment'],
      weaknesses: [],
      skillGaps: [],
      experienceConcerns: [],
      hiringRisks: ['Requires remote autonomy'],
      hiringConfidence: 91,
      jobFitObservations: ['Ideal fit for director opening'],
      recruiterFocusAreas: ['Probe international team leadership'],
      recommendation: 'STRONG_HIRE_CONSIDERATION',
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    }

    vi.spyOn(aiService, 'createAiInsights').mockResolvedValueOnce(mockInsight)

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateAiInsights candidateId="cand_1" />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Engineering Director/)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/Target Requisition for Evaluation/i)
    fireEvent.change(select, { target: { value: 'job_1' } })

    const generateBtn = screen.getByRole('button', { name: /Generate Recruiter Insights/i })
    expect(generateBtn).not.toBeDisabled()

    fireEvent.click(generateBtn)

    expect(await screen.findByTestId('ai-insight-summary-card')).toBeInTheDocument()
    expect(screen.getByText('Demonstrated excellence in org-scale transformation.')).toBeInTheDocument()
    expect(screen.getByText('91%')).toBeInTheDocument()
    expect(screen.getByText('Requires remote autonomy')).toBeInTheDocument()
  })

  it('handles error state with retry option', async () => {
    vi.spyOn(aiService, 'createAiInsights').mockRejectedValueOnce(
      new Error('Model execution failure')
    )

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateAiInsights candidateId="cand_1" />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Engineering Director/)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/Target Requisition for Evaluation/i)
    fireEvent.change(select, { target: { value: 'job_1' } })

    fireEvent.click(screen.getByRole('button', { name: /Generate Recruiter Insights/i }))

    expect(await screen.findByTestId('ai-error-state')).toBeInTheDocument()
    expect(screen.getByText('Model execution failure')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry Evaluation/i })).toBeInTheDocument()
  })
})
