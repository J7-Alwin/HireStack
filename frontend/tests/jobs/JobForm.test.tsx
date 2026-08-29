import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobForm } from '@/features/jobs/components/JobForm'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'

describe('JobForm Component', () => {
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
    vi.spyOn(jobsService, 'getDepartmentOptions').mockResolvedValue([
      { id: 'dept_eng', name: 'Engineering' },
    ])
  })

  const renderComponent = (props: any = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <JobForm onSubmit={vi.fn()} onCancel={vi.fn()} {...props} />
        </AuthProvider>
      </QueryClientProvider>
    )

  it('renders all form sections, controls, and department options', async () => {
    renderComponent()

    expect(screen.getByText('Role Overview')).toBeInTheDocument()
    expect(screen.getByText('Job Description & Requirements')).toBeInTheDocument()
    expect(screen.getByText('Experience & Compensation')).toBeInTheDocument()
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Department/i)).toBeInTheDocument()
    expect(await screen.findByText('Engineering')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Job Requisition/i })).toBeInTheDocument()
  })

  it('validates required fields before submitting', () => {
    const onSubmit = vi.fn()
    renderComponent({ onSubmit })

    const submitBtn = screen.getByRole('button', { name: /Create Job Requisition/i })
    fireEvent.click(submitBtn)

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits correctly when valid data is entered', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderComponent({ onSubmit })

    await screen.findByText('Engineering')

    fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: 'Staff Security Engineer' } })
    fireEvent.change(screen.getByLabelText(/Department/i), { target: { value: 'dept_eng' } })
    fireEvent.change(screen.getByLabelText(/Overview \/ Description/i), {
      target: { value: 'Oversee corporate infosec and compliance.' },
    })

    const submitBtn = screen.getByRole('button', { name: /Create Job Requisition/i })
    fireEvent.click(submitBtn)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Staff Security Engineer',
        departmentId: 'dept_eng',
        description: 'Oversee corporate infosec and compliance.',
      })
    )
  })
})
