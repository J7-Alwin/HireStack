import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  AiBadge,
  AiDisclaimer,
  AiLoadingState,
  AiErrorState,
  AtsScoreCard,
  JobMatchRankingTable,
  ResumeRecommendationList,
  InterviewKitPanel,
  AiInsightSummaryCard,
} from '@/features/ai/components'
import type {
  ATSScoreResponse,
  CandidateMatchResponse,
  ResumeRecommendationResponse,
  InterviewAssistantResponse,
  AiInsightResponse,
} from '@/features/ai/types'

describe('AI Presentation Components', () => {
  it('renders AiBadge with default and custom labels', () => {
    const { rerender } = render(<AiBadge />)
    expect(screen.getByText('AI Generated')).toBeInTheDocument()

    rerender(<AiBadge label="Custom Model" variant="neutral" />)
    expect(screen.getByText('Custom Model')).toBeInTheDocument()
  })

  it('renders AiDisclaimer with standard decision support message', () => {
    render(<AiDisclaimer />)
    expect(screen.getByTestId('ai-disclaimer')).toHaveTextContent(
      'decision support and should be reviewed by a qualified recruiter'
    )
  })

  it('renders AiLoadingState in spinner and skeleton variants', () => {
    const { rerender } = render(<AiLoadingState title="Analyzing Candidate..." />)
    expect(screen.getByTestId('ai-loading-spinner')).toBeInTheDocument()
    expect(screen.getByText('Analyzing Candidate...')).toBeInTheDocument()

    rerender(<AiLoadingState title="Loading Skeleton" variant="skeleton" />)
    expect(screen.getByTestId('ai-loading-skeleton')).toBeInTheDocument()
  })

  it('renders AiErrorState with message and invokes retry callback', () => {
    const onRetry = vi.fn()
    render(
      <AiErrorState
        title="Model Connection Failed"
        error="Ollama timed out"
        onRetry={onRetry}
      />
    )

    expect(screen.getByText('Model Connection Failed')).toBeInTheDocument()
    expect(screen.getByText('Ollama timed out')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Retry Evaluation/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders AtsScoreCard with overall score, dimensions, and breakdown', () => {
    const mockScore: ATSScoreResponse = {
      overallScore: 85,
      skillScore: 90,
      experienceScore: 80,
      educationScore: 75,
      keywordScore: 88,
      certificationScore: 70,
      strengths: ['Strong Go concurrency background'],
      weaknesses: ['No cloud certs'],
      missingSkills: ['Terraform'],
      recommendations: ['Check system architecture design'],
      hiringRecommendation: 'RECOMMENDED',
      overallReason: 'Great technical match for backend developer requisition',
    }

    render(<AtsScoreCard score={mockScore} />)

    expect(screen.getByTestId('ats-score-card')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('Recommended')).toBeInTheDocument()
    expect(screen.getByText('Strong Go concurrency background')).toBeInTheDocument()
    expect(screen.getByText('Terraform')).toBeInTheDocument()
    expect(screen.getByText(/Great technical match for backend developer/)).toBeInTheDocument()
  })

  it('renders JobMatchRankingTable with ranked applicants and actions', () => {
    const matches: CandidateMatchResponse[] = [
      { candidateId: 'c1', candidateName: 'Bruce Wayne', matchPercentage: 92, recommendation: 'STRONGLY_RECOMMENDED' },
      { candidateId: 'c2', candidateName: 'Barry Allen', matchPercentage: 78, recommendation: 'RECOMMENDED' },
    ]
    const onSelect = vi.fn()

    render(
      <MemoryRouter>
        <JobMatchRankingTable matches={matches} onSelectCandidate={onSelect} />
      </MemoryRouter>
    )

    expect(screen.getByText('Bruce Wayne')).toBeInTheDocument()
    expect(screen.getByText('Barry Allen')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
    expect(screen.getByText('78%')).toBeInTheDocument()

    const viewButtons = screen.getAllByRole('button', { name: /View Breakdown/i })
    fireEvent.click(viewButtons[0])
    expect(onSelect).toHaveBeenCalledWith('c1')
  })

  it('renders ResumeRecommendationList with priority items and suggestions', () => {
    const mockRecs: ResumeRecommendationResponse = {
      id: 'rec_1',
      candidateId: 'cand_1',
      jobId: null,
      mode: 'GENERAL',
      overallSummary: 'Strong fundamentals with missing impact metrics.',
      recommendations: [
        {
          category: 'EXPERIENCE',
          priority: 'HIGH',
          currentIssue: 'Descriptions lack metrics',
          recommendation: 'Quantify latency improvements',
          reason: 'Show measurable value',
          evidence: 'Lead Backend Engineer role',
          expectedImprovement: 'Higher senior callback rate',
        },
      ],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    }

    render(<ResumeRecommendationList data={mockRecs} />)

    expect(screen.getByText('Resume Optimization Recommendations')).toBeInTheDocument()
    expect(screen.getByText(/Strong fundamentals with missing impact metrics/)).toBeInTheDocument()
    expect(screen.getByText('Quantify latency improvements')).toBeInTheDocument()
    expect(screen.getByText(/HIGH Priority/i)).toBeInTheDocument()
  })

  it('renders InterviewKitPanel with tailored questions and follow-ups', () => {
    const mockInterview: InterviewAssistantResponse = {
      id: 'int_1',
      candidateId: 'cand_1',
      jobId: 'job_1',
      mode: 'JOB_SPECIFIC',
      overallSummary: 'Evaluate microservices architecture and fault tolerance.',
      questions: [
        {
          category: 'TECHNICAL',
          question: 'How would you handle eventual consistency in payments?',
          reason: 'Assess transactional integrity knowledge',
          difficulty: 'HARD',
          followUps: ['What happens during a dual-write failure?'],
        },
      ],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    }

    render(<InterviewKitPanel data={mockInterview} />)

    expect(screen.getByText('Tailored Interview Kit')).toBeInTheDocument()
    expect(screen.getByText('How would you handle eventual consistency in payments?')).toBeInTheDocument()
    expect(screen.getByText('HARD')).toBeInTheDocument()
    expect(screen.getByText('What happens during a dual-write failure?')).toBeInTheDocument()
  })

  it('renders AiInsightSummaryCard with confidence, risks, and recruiter focus', () => {
    const mockInsight: AiInsightResponse = {
      id: 'ins_1',
      candidateId: 'cand_1',
      jobId: 'job_1',
      overallInsight: 'Exceptional system design lead with high ownership.',
      strengths: ['Domain knowledge', 'Mentorship'],
      weaknesses: [],
      skillGaps: ['Rust'],
      experienceConcerns: [],
      hiringRisks: ['Notice period is 90 days'],
      hiringConfidence: 88,
      jobFitObservations: ['Strong culture fit'],
      recruiterFocusAreas: ['Negotiate joining timeline'],
      recommendation: 'SHORTLIST_FOR_FINAL',
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    }

    render(<AiInsightSummaryCard data={mockInsight} />)

    expect(screen.getByText('Recruiter AI Insights & Risk Analysis')).toBeInTheDocument()
    expect(screen.getByText('88%')).toBeInTheDocument()
    expect(screen.getByText('Notice period is 90 days')).toBeInTheDocument()
    expect(screen.getByText('Negotiate joining timeline')).toBeInTheDocument()
    expect(screen.getByText('Rust')).toBeInTheDocument()
  })
})
