import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InterviewAiAssistant } from '@/features/interviews/components/InterviewAiAssistant'
import { aiService } from '@/features/ai/services/ai.service'
import * as authModule from '@/features/auth'
import { Role } from '@/types'
import type {
  InterviewAssistantResponse,
  InterviewHistoryResponse,
} from '@/features/ai/types'

describe('InterviewAiAssistant Component', () => {
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
      user: { id: 'u_recruiter', email: 'recruiter@company.com', role: Role.RECRUITER },
      isAuthenticated: true,
      isLoading: false,
    } as any)
  })

  const mockHistoryEmpty: InterviewHistoryResponse = {
    candidateId: 'cand_123',
    totalGenerations: 0,
    history: [],
  }

  const mockGeneratedKit: InterviewAssistantResponse = {
    id: 'int_kit_1',
    candidateId: 'cand_123',
    jobId: 'job_456',
    mode: 'JOB_SPECIFIC',
    overallSummary: 'Focus on distributed caching and concurrency models.',
    questions: [
      {
        category: 'TECHNICAL',
        question: 'How do you handle cache invalidation in distributed Redis clusters?',
        reason: 'Validates candidate claims about high-throughput distributed architectures.',
        difficulty: 'HARD',
        followUps: [
          'What happens during network partitions?',
          'How do you prevent cache stampede?',
        ],
      },
      {
        category: 'BEHAVIORAL',
        question: 'Describe a time you had to negotiate technical debt with product management.',
        reason: 'Evaluates pragmatic prioritization and cross-functional leadership.',
        difficulty: 'MEDIUM',
        followUps: ['What metrics did you track to justify refactoring?'],
      },
    ],
    aiModel: 'mistral-7b-instruct',
    promptVersion: 'v2.1',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
  }

  const mockGeneralKit: InterviewAssistantResponse = {
    id: 'int_kit_2',
    candidateId: 'cand_123',
    jobId: null,
    mode: 'GENERAL',
    overallSummary: 'General engineering background assessment.',
    questions: [
      {
        category: 'HR',
        question: 'What work environments bring out your best technical performance?',
        reason: 'Identifies cultural and organizational fit.',
        difficulty: 'EASY',
        followUps: ['How do you manage asynchronous collaboration?'],
      },
    ],
    aiModel: 'mistral-7b-instruct',
    promptVersion: 'v2.1',
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-10T08:00:00Z',
  }

  const renderComponent = (props: Partial<Parameters<typeof InterviewAiAssistant>[0]> = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <InterviewAiAssistant
            candidateId="cand_123"
            jobId="job_456"
            candidateName="Alice Johnson"
            jobTitle="Senior Backend Engineer"
            applicationId="app_789"
            {...props}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders initial empty state with role-specific and general kit buttons when no history exists', async () => {
    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValueOnce(mockHistoryEmpty)

    renderComponent()

    expect(
      await screen.findByText('No AI Interview Guidance Generated Yet')
    ).toBeInTheDocument()
    expect(screen.getByText('AI Interview Assistant')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Prepare Role-Specific Interview Kit/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Prepare General Interview Kit/i })
    ).toBeInTheDocument()
  })

  it('explicitly triggers job-specific interview kit generation on button click and renders results', async () => {
    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValueOnce(mockHistoryEmpty)
    const createJobSpy = vi
      .spyOn(aiService, 'createJobInterviewAssistant')
      .mockResolvedValueOnce(mockGeneratedKit)

    renderComponent()

    const generateBtn = await screen.findByTestId('generate-job-interview-btn')
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(createJobSpy).toHaveBeenCalledWith({
        candidateId: 'cand_123',
        jobId: 'job_456',
      })
    })

    expect(await screen.findByTestId('interview-kit-panel')).toBeInTheDocument()
    expect(
      screen.getByText('How do you handle cache invalidation in distributed Redis clusters?')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Validates candidate claims about high-throughput distributed architectures.')
    ).toBeInTheDocument()
    expect(screen.getByText('What happens during network partitions?')).toBeInTheDocument()
    expect(screen.getByText('Mode: Role-Specific')).toBeInTheDocument()
  })

  it('explicitly triggers general interview kit generation on button click', async () => {
    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValueOnce(mockHistoryEmpty)
    const createGeneralSpy = vi
      .spyOn(aiService, 'createInterviewAssistant')
      .mockResolvedValueOnce(mockGeneralKit)

    renderComponent()

    const generateBtn = await screen.findByTestId('generate-general-interview-btn')
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(createGeneralSpy).toHaveBeenCalledWith({
        candidateId: 'cand_123',
      })
    })

    expect(await screen.findByTestId('interview-kit-panel')).toBeInTheDocument()
    expect(
      screen.getByText('What work environments bring out your best technical performance?')
    ).toBeInTheDocument()
    expect(screen.getByText('Mode: General')).toBeInTheDocument()
  })

  it('renders historical kits and switches between them when clicked', async () => {
    const mockHistoryWithMultiple: InterviewHistoryResponse = {
      candidateId: 'cand_123',
      totalGenerations: 2,
      history: [mockGeneratedKit, mockGeneralKit],
    }

    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValueOnce(
      mockHistoryWithMultiple
    )

    renderComponent()

    expect(await screen.findByTestId('interview-kit-panel')).toBeInTheDocument()
    expect(
      screen.getByText('How do you handle cache invalidation in distributed Redis clusters?')
    ).toBeInTheDocument()

    const historyTab2 = screen.getByTestId('history-kit-tab-1')
    fireEvent.click(historyTab2)

    expect(
      await screen.findByText('What work environments bring out your best technical performance?')
    ).toBeInTheDocument()
  })

  it('handles error state and provides retry trigger', async () => {
    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValueOnce(mockHistoryEmpty)
    const createJobSpy = vi
      .spyOn(aiService, 'createJobInterviewAssistant')
      .mockRejectedValueOnce(new Error('Inference server timeout'))

    renderComponent()

    const generateBtn = await screen.findByTestId('generate-job-interview-btn')
    fireEvent.click(generateBtn)

    expect(await screen.findByText('Interview Kit Generation Failed')).toBeInTheDocument()
    expect(screen.getByText('Inference server timeout')).toBeInTheDocument()

    // Retry
    createJobSpy.mockResolvedValueOnce(mockGeneratedKit)
    const retryBtn = screen.getByRole('button', { name: /Retry/i })
    fireEvent.click(retryBtn)

    expect(await screen.findByTestId('interview-kit-panel')).toBeInTheDocument()
  })

  it('renders context navigation links to candidate and job', async () => {
    const mockHistorySingle: InterviewHistoryResponse = {
      candidateId: 'cand_123',
      totalGenerations: 1,
      history: [mockGeneratedKit],
    }

    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValueOnce(mockHistorySingle)

    renderComponent()

    expect(await screen.findByText('Candidate Profile')).toHaveAttribute(
      'href',
      '/app/candidates/cand_123'
    )
    expect(screen.getByText('Senior Backend Engineer')).toHaveAttribute(
      'href',
      '/app/jobs/job_456'
    )
    expect(screen.getByText('Application')).toHaveAttribute(
      'href',
      '/app/applications/app_789'
    )
  })
})
