import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InterviewDetailPage } from '@/features/interviews/pages/InterviewDetailPage'
import { interviewsService } from '@/features/interviews/services/interviews.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Interview } from '@/features/interviews/types/interviews.types'

describe('InterviewDetailPage Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAuthStore.getState().reset()
    useAuthStore.getState().setAuthenticated({
      id: 'usr_rec',
      email: 'recruiter@hirestack.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })
    vi.restoreAllMocks()
  })

  const mockInterview: Interview = {
    id: 'int_123',
    interviewCode: 'INT-000001',
    companyId: 'comp_1',
    applicationId: 'app_1',
    interviewType: 'INTERNAL',
    round: 'TECHNICAL',
    status: 'SCHEDULED',
    outcome: null,
    mode: 'ONLINE',
    scheduledDate: '2026-03-01T00:00:00.000Z',
    startTime: '2026-03-01T10:00:00.000Z',
    endTime: '2026-03-01T11:00:00.000Z',
    timeZone: 'Asia/Kolkata',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    location: null,
    notes: 'Please evaluate system design architecture.',
    resultNotes: null,
    cancellationReason: null,
    createdBy: 'usr_rec',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    application: {
      id: 'app_1',
      applicationCode: 'APP-000001',
      stage: 'TECHNICAL_INTERVIEW',
      status: 'ACTIVE',
      assignedRecruiterId: 'usr_rec',
      assignedRecruiter: {
        id: 'usr_rec',
        name: 'Recruiter Admin',
        email: 'recruiter@company.com',
      },
      candidate: {
        id: 'cand_1',
        candidateCode: 'CAN-001',
        firstName: 'Diana',
        lastName: 'Prince',
        email: 'diana@example.com',
        phone: '+1-555-0199',
      },
      job: {
        id: 'job_1',
        jobCode: 'JOB-001',
        title: 'Staff Security Engineer',
      },
    },
    interviewers: [
      {
        id: 'ii_1',
        interviewerId: 'usr_int',
        interviewer: {
          id: 'usr_int',
          name: 'Clark Kent',
          email: 'clark@company.com',
        },
      },
    ],
  }

  const renderComponent = (id = 'int_123') =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/app/interviews/${id}`]}>
          <AuthProvider>
            <Routes>
              <Route path="/app/interviews/:interviewId" element={<InterviewDetailPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders interview detail with all sections, relations, and action buttons', async () => {
    vi.spyOn(interviewsService, 'getInterviewById').mockResolvedValueOnce(mockInterview)

    renderComponent()

    expect(await screen.findByRole('heading', { name: /INT-000001/ })).toBeInTheDocument()
    expect(screen.getByText('Diana Prince')).toBeInTheDocument()
    expect(screen.getByText('diana@example.com')).toBeInTheDocument()
    expect(screen.getByText('Staff Security Engineer')).toBeInTheDocument()
    expect(screen.getByText('Interview Schedule & Location')).toBeInTheDocument()
    expect(screen.getByText('View Candidate')).toBeInTheDocument()
    expect(screen.getByText('View Job')).toBeInTheDocument()
    expect(screen.getByText('View Application')).toBeInTheDocument()
    expect(screen.getByText('Interview Actions')).toBeInTheDocument()
  })

  it('renders not found error state when interview does not exist', async () => {
    vi.spyOn(interviewsService, 'getInterviewById').mockRejectedValueOnce(
      new Error('Interview not found')
    )

    renderComponent('non_existent')

    expect(await screen.findByText('Interview Not Found')).toBeInTheDocument()
    expect(screen.getByText('Back to Interviews')).toBeInTheDocument()
  })
})
