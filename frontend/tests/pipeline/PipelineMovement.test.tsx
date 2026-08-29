import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PipelineMoveModal } from '@/features/pipeline/components/PipelineMoveModal'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Pipeline } from '@/features/pipeline/types/pipeline.types'

describe('Pipeline Stage Movement Interaction', () => {
  beforeEach(() => {
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  const mockPipeline: Pipeline = {
    id: 'pipe_1',
    companyId: 'comp_1',
    applicationId: 'app_1',
    candidateId: 'cand_1',
    recruiterId: 'usr_rec',
    jobId: 'job_1',
    currentStage: 'APPLIED',
    stageChangedAt: '2026-03-01T00:00:00Z',
    stageOrder: 1,
    isCompleted: false,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    candidate: {
      id: 'cand_1',
      candidateCode: 'CAN-001',
      firstName: 'Victor',
      lastName: 'Stone',
    },
    job: {
      id: 'job_1',
      jobCode: 'JOB-001',
      title: 'Cybernetic Systems Engineer',
    },
  }

  it('allows recruiter to move candidate sequentially (SCREENING, REJECTED, WITHDRAWN)', async () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_rec',
      email: 'recruiter@company.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })

    const onConfirm = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <MemoryRouter>
        <AuthProvider>
          <PipelineMoveModal
            isOpen={true}
            onClose={onClose}
            pipeline={mockPipeline}
            onConfirm={onConfirm}
          />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Move Candidate Stage')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Enable Administrator Stage Override/i)).not.toBeInTheDocument()

    // Confirm move
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Stage Move' }))

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        toStage: 'SCREENING',
        isOverride: false,
      })
    )
  })

  it('allows company admin to toggle override and requires override reason', async () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_admin',
      email: 'admin@company.com',
      role: Role.COMPANY_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })

    const onConfirm = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <MemoryRouter>
        <AuthProvider>
          <PipelineMoveModal
            isOpen={true}
            onClose={onClose}
            pipeline={mockPipeline}
            onConfirm={onConfirm}
          />
        </AuthProvider>
      </MemoryRouter>
    )

    const overrideCheckbox = screen.getByLabelText(/Enable Administrator Stage Override/i)
    expect(overrideCheckbox).toBeInTheDocument()
    fireEvent.click(overrideCheckbox)

    // Select non-sequential stage e.g. OFFER_PENDING
    fireEvent.change(screen.getByLabelText(/Target Stage/i), {
      target: { value: 'OFFER_PENDING' },
    })

    // Click confirm without reason -> shows error
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Stage Move' }))
    expect(await screen.findByText(/Admin stage override requires an explanation reason/)).toBeInTheDocument()

    // Provide valid reason
    fireEvent.change(screen.getByLabelText(/Override Reason/i), {
      target: { value: 'Fast tracked by CTO direct recommendation' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Confirm Stage Move' }))

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        toStage: 'OFFER_PENDING',
        reason: 'Fast tracked by CTO direct recommendation',
        isOverride: true,
      })
    )
  })
})
