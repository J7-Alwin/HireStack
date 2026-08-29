import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CandidateResumeRecommendations } from '@/features/candidates/components/CandidateResumeRecommendations'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { aiService } from '@/features/ai/services/ai.service'
import type { ResumeRecommendationResponse } from '@/features/ai/types'

describe('CandidateResumeRecommendations Component', () => {
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
          title: 'Frontend Architect',
          jobCode: 'JOB-002',
        } as any,
      ],
      meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
    })

    vi.spyOn(aiService, 'getResumeRecommendationHistory').mockResolvedValue([
      {
        id: 'rec_hist_1',
        candidateId: 'cand_1',
        jobId: null,
        mode: 'GENERAL',
        overallSummary: 'Historical general summary',
        createdAt: '2026-02-15T00:00:00Z',
      },
    ])
  })

  it('renders initial empty state with mode toggle and history items', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CandidateResumeRecommendations candidateId="cand_1" />
      </QueryClientProvider>
    )

    expect(screen.getByTestId('resume-recommendations-empty-state')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /General Resume Review/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Role-Targeted Optimization/i })).toBeInTheDocument()

    // Previous history item
    expect(await screen.findByText(/Previous Reviews:/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^General \(/i })).toBeInTheDocument()
  })

  it('generates general resume recommendations on user trigger', async () => {
    const mockRec: ResumeRecommendationResponse = {
      id: 'rec_1',
      candidateId: 'cand_1',
      jobId: null,
      mode: 'GENERAL',
      overallSummary: 'Solid engineering accomplishments.',
      recommendations: [
        {
          category: 'ATS_OPTIMIZATION',
          priority: 'HIGH',
          currentIssue: 'Headers non-standard',
          recommendation: 'Use standard section titles',
          reason: 'Improve parsing fidelity',
          evidence: 'Custom section labels found',
          expectedImprovement: '100% section extraction',
        },
      ],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    }

    vi.spyOn(aiService, 'createResumeRecommendations').mockResolvedValueOnce(mockRec)

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateResumeRecommendations candidateId="cand_1" />
      </QueryClientProvider>
    )

    const analyzeBtn = screen.getByRole('button', { name: /^Analyze Resume$/i })
    fireEvent.click(analyzeBtn)

    expect(await screen.findByTestId('resume-recommendation-list')).toBeInTheDocument()
    expect(screen.getByText('Solid engineering accomplishments.')).toBeInTheDocument()
    expect(screen.getByText('Use standard section titles')).toBeInTheDocument()
  })

  it('supports job-specific recommendation mode with job selection', async () => {
    const mockJobRec: ResumeRecommendationResponse = {
      id: 'rec_job_1',
      candidateId: 'cand_1',
      jobId: 'job_1',
      mode: 'JOB_SPECIFIC',
      overallSummary: 'Tailored analysis for Frontend Architect.',
      recommendations: [
        {
          category: 'SKILLS',
          priority: 'MEDIUM',
          currentIssue: 'Micro-frontends not highlighted',
          recommendation: 'Highlight architectural leadership in micro-frontends',
          reason: 'Key requirement for job_1',
          evidence: 'Experience section',
          expectedImprovement: 'Stronger technical fit perception',
        },
      ],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    }

    vi.spyOn(aiService, 'createJobResumeRecommendations').mockResolvedValueOnce(mockJobRec)

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateResumeRecommendations candidateId="cand_1" />
      </QueryClientProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Role-Targeted Optimization/i }))

    await waitFor(() => {
      expect(screen.getByText(/Frontend Architect/)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/Target Job Requisition/i)
    fireEvent.change(select, { target: { value: 'job_1' } })

    const analyzeJobBtn = screen.getByRole('button', { name: /Analyze Resume for Job/i })
    fireEvent.click(analyzeJobBtn)

    expect(await screen.findByTestId('resume-recommendation-list')).toBeInTheDocument()
    expect(screen.getByText('Tailored analysis for Frontend Architect.')).toBeInTheDocument()
    expect(screen.getByText('Highlight architectural leadership in micro-frontends')).toBeInTheDocument()
  })
})
