import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobAiMatchDetailModal } from '@/features/jobs/components/JobAiMatchDetailModal'
import { aiService } from '@/features/ai/services/ai.service'
import type { JobMatchDetailsResponse } from '@/features/ai/types'

describe('JobAiMatchDetailModal Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.restoreAllMocks()
  })

  const mockDetail: JobMatchDetailsResponse = {
    id: 'jm_101',
    jobId: 'job_123',
    candidateId: 'cand_1',
    candidateName: 'Alice Johnson',
    matchPercentage: 88,
    skillMatch: 90,
    experienceMatch: 85,
    educationMatch: 80,
    projectMatch: 95,
    keywordMatch: 88,
    strengths: ['Expert in React and TypeScript', '5+ years distributed systems experience'],
    missingSkills: ['Kubernetes cluster administration'],
    overallReason: 'Strong technical and architectural alignment with minimal ramp-up required.',
    recommendation: 'STRONGLY_RECOMMENDED',
    aiModel: 'mistral-7b',
    promptVersion: '1.2.0',
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z',
  }

  const renderComponent = (props?: Partial<Parameters<typeof JobAiMatchDetailModal>[0]>) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <JobAiMatchDetailModal
            isOpen={true}
            onClose={vi.fn()}
            jobId="job_123"
            candidateId="cand_1"
            {...props}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders granular match breakdown with scores, dimensions, strengths, and reasoning', async () => {
    vi.spyOn(aiService, 'getCandidateJobMatch').mockResolvedValueOnce(mockDetail)

    renderComponent()

    expect(await screen.findByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('88% Overall')).toBeInTheDocument()
    expect(screen.getByText('Strongly Recommended')).toBeInTheDocument()

    // Dimensions
    expect(screen.getByText('Skill Match')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('Experience Match')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('Education Match')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('Project Match')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText('Keyword Match')).toBeInTheDocument()
    expect(screen.getByText('88%')).toBeInTheDocument()

    // Strengths & Missing Skills
    expect(screen.getByText('Expert in React and TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Kubernetes cluster administration')).toBeInTheDocument()

    // Reasoning
    expect(
      screen.getByText('Strong technical and architectural alignment with minimal ramp-up required.')
    ).toBeInTheDocument()

    // Metadata
    expect(screen.getByText(/mistral-7b/i)).toBeInTheDocument()
    expect(screen.getByText(/v1.2.0/i)).toBeInTheDocument()

    // Candidate link
    const candidateLink = screen.getByRole('link', { name: /View Full Profile/i })
    expect(candidateLink).toHaveAttribute('href', '/app/candidates/cand_1')
  })

  it('handles error state when match detail fails to load', async () => {
    vi.spyOn(aiService, 'getCandidateJobMatch').mockRejectedValueOnce(
      new Error('Match detail not found.')
    )

    renderComponent()

    expect(await screen.findByTestId('ai-error-state')).toBeInTheDocument()
    expect(screen.getByText('Match detail not found.')).toBeInTheDocument()
  })

  it('does not render if candidateId is null', () => {
    const { container } = renderComponent({ candidateId: null })
    expect(container).toBeEmptyDOMElement()
  })
})
