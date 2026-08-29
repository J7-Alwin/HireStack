import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InterviewForm } from '@/features/interviews/components/InterviewForm'
import { applicationsService } from '@/features/applications/services/applications.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Application } from '@/features/applications/types/applications.types'

describe('InterviewForm Component', () => {
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
    vi.spyOn(applicationsService, 'listApplications').mockResolvedValue({
      data: [mockApp],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })
  })

  const mockApp: Application = {
    id: 'app_1',
    applicationCode: 'APP-000001',
    companyId: 'comp_1',
    candidateId: 'cand_1',
    candidate: {
      id: 'cand_1',
      candidateCode: 'CAN-001',
      firstName: 'Bruce',
      lastName: 'Wayne',
      email: 'bruce@wayne.com',
      status: 'ACTIVE',
    },
    jobId: 'job_1',
    job: {
      id: 'job_1',
      jobCode: 'JOB-001',
      title: 'Lead Architect',
      status: 'OPEN',
    },
    assignedRecruiterId: 'usr_rec',
    stage: 'SCREENING',
    status: 'ACTIVE',
    source: 'REFERRAL',
    appliedAt: '2026-02-01T00:00:00Z',
    createdBy: 'usr_rec',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  }

  it('renders create interview form with application selection and inputs', async () => {
    const handleSubmit = vi.fn()
    const handleCancel = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <InterviewForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('Application Context')).toBeInTheDocument()
    expect(screen.getByText('Interview Parameters')).toBeInTheDocument()
    expect(screen.getByText('Schedule & Timezone')).toBeInTheDocument()
    expect(screen.getByText('Notes & Preparation')).toBeInTheDocument()
    expect(await screen.findByText(/APP-000001 — Bruce Wayne/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Schedule Interview' })).toBeInTheDocument()
  })

  it('submits correctly when valid data is entered', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    const handleCancel = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <InterviewForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await screen.findByText(/APP-000001 — Bruce Wayne/)

    fireEvent.change(screen.getByLabelText(/Application/i), { target: { value: 'app_1' } })
    fireEvent.change(screen.getByLabelText(/Scheduled Date/i), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '14:00' } })
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '15:00' } })
    fireEvent.change(screen.getByLabelText(/Meeting URL/i), {
      target: { value: 'https://meet.google.com/test-room' },
    })

    const submitBtn = screen.getByRole('button', { name: 'Schedule Interview' })
    fireEvent.click(submitBtn)

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: 'app_1',
        mode: 'ONLINE',
        meetingLink: 'https://meet.google.com/test-room',
      })
    )
  })

  it('renders edit mode with editable notes and mode', async () => {
    const handleSubmit = vi.fn()
    const handleCancel = vi.fn()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <InterviewForm
              initialValues={{
                id: 'int_1',
                interviewCode: 'INT-000001',
                mode: 'ONLINE',
                meetingLink: 'https://meet.google.com/test',
                notes: 'Existing instructions',
              }}
              isEdit={true}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Interview Context')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })
})
