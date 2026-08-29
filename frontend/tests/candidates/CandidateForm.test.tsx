import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CandidateForm } from '@/features/candidates/components/CandidateForm'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'

describe('CandidateForm Component', () => {
  beforeEach(() => {
    useAuthStore.getState().reset()
    useAuthStore.getState().setAuthenticated({
      id: 'usr_rec',
      email: 'recruiter@hirestack.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })
  })

  it('renders all form sections and controls', () => {
    render(
      <AuthProvider>
        <CandidateForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      </AuthProvider>
    )

    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByText('Professional Experience')).toBeInTheDocument()
    expect(screen.getByText('Location & Links')).toBeInTheDocument()
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Candidate/i })).toBeInTheDocument()
  })

  it('validates required fields before submitting', async () => {
    const onSubmit = vi.fn()
    render(
      <AuthProvider>
        <CandidateForm onSubmit={onSubmit} onCancel={vi.fn()} />
      </AuthProvider>
    )

    const submitBtn = screen.getByRole('button', { name: /Create Candidate/i })
    fireEvent.click(submitBtn)

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits correctly when valid data is entered', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <AuthProvider>
        <CandidateForm onSubmit={onSubmit} onCancel={vi.fn()} />
      </AuthProvider>
    )

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Katherine' } })
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Johnson' } })
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'katherine@nasa.gov' } })

    const submitBtn = screen.getByRole('button', { name: /Create Candidate/i })
    fireEvent.click(submitBtn)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Katherine',
        lastName: 'Johnson',
        email: 'katherine@nasa.gov',
      })
    )
  })
})
