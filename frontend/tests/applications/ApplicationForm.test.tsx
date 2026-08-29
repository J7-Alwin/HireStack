import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApplicationForm } from '@/features/applications/components/ApplicationForm'
import { candidatesService } from '@/features/candidates/services/candidates.service'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'

describe('ApplicationForm Component', () => {
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
    vi.spyOn(candidatesService, 'listCandidates').mockResolvedValue({
      data: [
        {
          id: 'cand_1',
          candidateCode: 'CAN-001',
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
          status: 'ACTIVE',
        } as any,
      ],
      meta: { total: 1, totalPages: 1, page: 1, limit: 100 },
    })
    vi.spyOn(jobsService, 'listJobs').mockResolvedValue({
      data: [
        {
          id: 'job_1',
          jobCode: 'JOB-001',
          title: 'Frontend Developer',
          status: 'OPEN',
        } as any,
      ],
      meta: { total: 1, totalPages: 1, page: 1, limit: 100 },
    })
  })

  const renderComponent = (props: any = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ApplicationForm onSubmit={vi.fn()} onCancel={vi.fn()} {...props} />
        </AuthProvider>
      </QueryClientProvider>
    )

  it('renders create form with candidate select and job select options', async () => {
    renderComponent()

    expect(screen.getByText('Application Parameters')).toBeInTheDocument()
    expect(screen.getByLabelText(/Candidate/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target Job Requisition/i)).toBeInTheDocument()
    expect(await screen.findByText('Alice Smith (alice@example.com)')).toBeInTheDocument()
    expect(await screen.findByText('Frontend Developer (JOB-001)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Application/i })).toBeInTheDocument()
  })

  it('submits correctly when valid data is entered', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderComponent({ onSubmit })

    await screen.findByText('Alice Smith (alice@example.com)')

    fireEvent.change(screen.getByLabelText(/Candidate/i), { target: { value: 'cand_1' } })
    fireEvent.change(screen.getByLabelText(/Target Job Requisition/i), { target: { value: 'job_1' } })
    fireEvent.change(screen.getByLabelText(/Remarks & Internal Notes/i), {
      target: { value: 'Candidate has strong React expertise.' },
    })

    const submitBtn = screen.getByRole('button', { name: /Create Application/i })
    fireEvent.click(submitBtn)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        candidateId: 'cand_1',
        jobId: 'job_1',
        remarks: 'Candidate has strong React expertise.',
      })
    )
  })
})
