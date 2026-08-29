import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InterviewsPage } from '@/features/interviews/pages/InterviewsPage'
import { interviewsService } from '@/features/interviews/services/interviews.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Interview } from '@/features/interviews/types/interviews.types'

describe('InterviewsPage Component', () => {
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
    id: 'int_1',
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
    notes: 'Coding interview',
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
      candidate: {
        id: 'cand_1',
        candidateCode: 'CAN-001',
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah@example.com',
      },
      job: {
        id: 'job_1',
        jobCode: 'JOB-001',
        title: 'Senior Systems Architect',
      },
    },
    interviewers: [],
  }

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/interviews']}>
          <AuthProvider>
            <InterviewsPage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders interviews list page with candidate, job, code, and schedule button', async () => {
    vi.spyOn(interviewsService, 'listInterviews').mockResolvedValueOnce({
      data: [mockInterview],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })

    renderComponent()

    expect(await screen.findByText('Sarah Connor')).toBeInTheDocument()
    expect(screen.getByText('Senior Systems Architect')).toBeInTheDocument()
    expect(screen.getByText('INT-000001')).toBeInTheDocument()
    expect(screen.getByText('Interviews')).toBeInTheDocument()
    expect(screen.getByText('Schedule Interview')).toBeInTheDocument()
  })

  it('renders empty state when no interviews exist', async () => {
    vi.spyOn(interviewsService, 'listInterviews').mockResolvedValueOnce({
      data: [],
      meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
    })

    renderComponent()

    expect(await screen.findByText('No interviews found')).toBeInTheDocument()
  })

  it('renders error state on API failure', async () => {
    vi.spyOn(interviewsService, 'listInterviews').mockRejectedValueOnce(
      new Error('Network error')
    )

    renderComponent()

    expect(await screen.findByText('Failed to load interviews')).toBeInTheDocument()
  })
})
