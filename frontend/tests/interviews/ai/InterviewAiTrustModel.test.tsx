import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InterviewDetailPage } from '@/features/interviews/pages/InterviewDetailPage'
import { interviewsService } from '@/features/interviews/services/interviews.service'
import { aiService } from '@/features/ai/services/ai.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Interview } from '@/features/interviews/types/interviews.types'
import type { InterviewAssistantResponse } from '@/features/ai/types'

describe('Interview AI Trust Model & Safety Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    useAuthStore.getState().reset()
    useAuthStore.getState().setAuthenticated({
      id: 'usr_recruiter',
      email: 'recruiter@company.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })
    vi.restoreAllMocks()
  })

  const mockInterview: Interview = {
    id: 'int_123',
    interviewCode: 'INT-000123',
    companyId: 'comp_1',
    applicationId: 'app_123',
    interviewType: 'INTERNAL',
    round: 'TECHNICAL',
    status: 'SCHEDULED',
    outcome: null,
    mode: 'ONLINE',
    scheduledDate: '2026-03-01',
    startTime: '10:00',
    endTime: '11:00',
    timeZone: 'UTC',
    notes: 'Focus on system design',
    createdBy: 'usr_recruiter',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    application: {
      id: 'app_123',
      applicationCode: 'APP-000123',
      stage: 'INTERVIEW',
      status: 'ACTIVE',
      candidate: {
        id: 'cand_123',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
      },
      job: {
        id: 'job_123',
        title: 'Principal Architect',
      },
    },
    interviewers: [],
  }

  const mockKit: InterviewAssistantResponse = {
    id: 'kit_123',
    candidateId: 'cand_123',
    jobId: 'job_123',
    mode: 'JOB_SPECIFIC',
    overallSummary: 'High potential in cloud infra.',
    questions: [
      {
        category: 'TECHNICAL',
        question: 'Design a distributed consensus mechanism.',
        reason: 'Architectural evaluation.',
        difficulty: 'HARD',
        followUps: ['How do you handle split-brain scenarios?'],
      },
    ],
    aiModel: 'mistral-7b-instruct',
    promptVersion: 'v2.1',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  }

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/interviews/int_123']}>
          <AuthProvider>
            <Routes>
              <Route path="/app/interviews/:interviewId" element={<InterviewDetailPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('does NOT automatically call AI generation APIs when InterviewDetailPage renders', async () => {
    vi.spyOn(interviewsService, 'getInterviewById').mockResolvedValueOnce(mockInterview)
    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValueOnce({
      candidateId: 'cand_123',
      totalGenerations: 0,
      history: [],
    })
    const createJobSpy = vi.spyOn(aiService, 'createJobInterviewAssistant')
    const createGeneralSpy = vi.spyOn(aiService, 'createInterviewAssistant')

    renderPage()

    expect(await screen.findByText('INT-000123')).toBeInTheDocument()
    expect(screen.getByText('AI Interview Assistant')).toBeInTheDocument()

    // Ensure zero auto-generation calls occurred
    expect(createJobSpy).not.toHaveBeenCalled()
    expect(createGeneralSpy).not.toHaveBeenCalled()
  })

  it('renders advisory disclaimers and does not auto-mutate ATS outcome or status when kit is generated', async () => {
    vi.spyOn(interviewsService, 'getInterviewById').mockResolvedValueOnce(mockInterview)
    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValueOnce({
      candidateId: 'cand_123',
      totalGenerations: 0,
      history: [],
    })
    vi.spyOn(aiService, 'createJobInterviewAssistant').mockResolvedValueOnce(mockKit)
    const updateOutcomeSpy = vi.spyOn(interviewsService, 'recordOutcome')
    const updateStatusSpy = vi.spyOn(interviewsService, 'updateStatus')

    renderPage()

    expect(await screen.findByText('INT-000123')).toBeInTheDocument()

    const generateBtn = screen.getByTestId('generate-job-interview-btn')
    fireEvent.click(generateBtn)

    expect(await screen.findByTestId('interview-kit-panel')).toBeInTheDocument()
    expect(
      screen.getAllByText(/decision support/i).length
    ).toBeGreaterThan(0)

    // Ensure no ATS mutations were executed
    expect(updateOutcomeSpy).not.toHaveBeenCalled()
    expect(updateStatusSpy).not.toHaveBeenCalled()
  })
})
