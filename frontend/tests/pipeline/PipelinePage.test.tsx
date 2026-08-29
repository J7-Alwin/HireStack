import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PipelinePage } from '@/features/pipeline/pages/PipelinePage'
import { pipelineService } from '@/features/pipeline/services/pipeline.service'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'
import type { Pipeline } from '@/features/pipeline/types/pipeline.types'

describe('PipelinePage Component', () => {
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
    vi.spyOn(jobsService, 'listJobs').mockResolvedValue({
      data: [{ id: 'job_1', jobCode: 'JOB-001', title: 'Data Engineer' } as any],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })
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
      firstName: 'Arthur',
      lastName: 'Curry',
      email: 'arthur@atlantis.gov',
    },
    job: {
      id: 'job_1',
      jobCode: 'JOB-001',
      title: 'Oceanographic Director',
    },
  }

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/pipeline']}>
          <AuthProvider>
            <PipelinePage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders pipeline page with header, filters, and active stage columns', async () => {
    vi.spyOn(pipelineService, 'listPipelines').mockResolvedValueOnce({
      data: [mockPipeline],
      meta: { total: 1, totalPages: 1, page: 1, limit: 100 },
    })

    renderComponent()

    expect(await screen.findByText('Hiring Pipeline')).toBeInTheDocument()
    expect(await screen.findByText('Arthur Curry')).toBeInTheDocument()
    expect(await screen.findByText('Oceanographic Director')).toBeInTheDocument()
    expect(screen.getByTestId('pipeline-column-APPLIED')).toBeInTheDocument()
    expect(screen.getByTestId('pipeline-column-SCREENING')).toBeInTheDocument()
  })

  it('opens stage move modal when Move Stage button is clicked', async () => {
    vi.spyOn(pipelineService, 'listPipelines').mockResolvedValueOnce({
      data: [mockPipeline],
      meta: { total: 1, totalPages: 1, page: 1, limit: 100 },
    })

    renderComponent()

    const moveBtn = await screen.findByRole('button', { name: /Move stage for Arthur Curry/i })
    fireEvent.click(moveBtn)

    expect(await screen.findByText('Move Candidate Stage')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm Stage Move' })).toBeInTheDocument()
  })

  it('opens history drawer when History button is clicked', async () => {
    vi.spyOn(pipelineService, 'listPipelines').mockResolvedValueOnce({
      data: [mockPipeline],
      meta: { total: 1, totalPages: 1, page: 1, limit: 100 },
    })
    vi.spyOn(pipelineService, 'getHistory').mockResolvedValueOnce([
      {
        id: 'hist_1',
        pipelineId: 'pipe_1',
        fromStage: null,
        toStage: 'APPLIED',
        movedById: 'usr_rec',
        movedAt: '2026-03-01T00:00:00Z',
      },
    ])
    vi.spyOn(pipelineService, 'getTimeline').mockResolvedValueOnce([])

    renderComponent()

    const histBtn = await screen.findByRole('button', { name: /View history for Arthur Curry/i })
    fireEvent.click(histBtn)

    expect(await screen.findByText(/Pipeline History & Activity — Arthur Curry/)).toBeInTheDocument()
  })

  it('renders error state on API failure', async () => {
    vi.spyOn(pipelineService, 'listPipelines').mockRejectedValueOnce(
      new Error('Failed to load pipeline')
    )

    renderComponent()

    expect(await screen.findByText('Failed to load hiring pipeline')).toBeInTheDocument()
  })
})
