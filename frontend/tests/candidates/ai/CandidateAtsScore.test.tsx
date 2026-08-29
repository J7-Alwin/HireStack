import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CandidateAtsScore } from '@/features/candidates/components/CandidateAtsScore'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { aiService } from '@/features/ai/services/ai.service'
import type { ATSScoreResponse } from '@/features/ai/types'

describe('CandidateAtsScore Component', () => {
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
          title: 'Senior Backend Engineer',
          jobCode: 'JOB-001',
          status: 'OPEN',
          departmentId: 'd1',
          department: { id: 'd1', name: 'Engineering' },
          employmentType: 'FULL_TIME',
          workplaceType: 'REMOTE',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        } as any,
      ],
      meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
    })
  })

  it('renders initial empty state with job selector and disabled calculate button', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CandidateAtsScore candidateId="cand_1" />
      </QueryClientProvider>
    )

    expect(screen.getByTestId('ats-score-empty-state')).toBeInTheDocument()
    expect(screen.getByText('No ATS Score Generated Yet')).toBeInTheDocument()

    const calculateBtn = screen.getByRole('button', { name: /Calculate ATS Score/i })
    expect(calculateBtn).toBeDisabled()

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText(/Senior Backend Engineer/)).toBeInTheDocument()
    })
  })

  it('enables button on job selection and calculates score on user action', async () => {
    const mockScore: ATSScoreResponse = {
      overallScore: 86,
      skillScore: 90,
      experienceScore: 85,
      educationScore: 80,
      keywordScore: 90,
      certificationScore: 75,
      strengths: ['Expert Go', 'Distributed Systems'],
      weaknesses: ['Limited Python'],
      missingSkills: ['Python'],
      recommendations: ['Focus on system design in round 2'],
      hiringRecommendation: 'RECOMMENDED',
      overallReason: 'Strong alignment with backend requirements',
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
    }

    vi.spyOn(aiService, 'createAtsScore').mockResolvedValueOnce(mockScore)

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateAtsScore candidateId="cand_1" />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Senior Backend Engineer/)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/Target Requisition for ATS Match/i)
    fireEvent.change(select, { target: { value: 'job_1' } })

    const calculateBtn = screen.getByRole('button', { name: /Calculate ATS Score/i })
    expect(calculateBtn).not.toBeDisabled()

    fireEvent.click(calculateBtn)

    expect(await screen.findByTestId('ats-score-card')).toBeInTheDocument()
    expect(screen.getByText('86%')).toBeInTheDocument()
    expect(screen.getByText('Recommended')).toBeInTheDocument()
    expect(screen.getByText('Expert Go')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('handles error state and provides retry button', async () => {
    vi.spyOn(aiService, 'createAtsScore').mockRejectedValueOnce(
      new Error('Ollama service timeout')
    )

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateAtsScore candidateId="cand_1" />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Senior Backend Engineer/)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/Target Requisition for ATS Match/i)
    fireEvent.change(select, { target: { value: 'job_1' } })

    fireEvent.click(screen.getByRole('button', { name: /Calculate ATS Score/i }))

    expect(await screen.findByTestId('ai-error-state')).toBeInTheDocument()
    expect(screen.getByText('Ollama service timeout')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry Evaluation/i })).toBeInTheDocument()
  })
})
