import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PipelineBoard } from '@/features/pipeline/components/PipelineBoard'
import type { Pipeline } from '@/features/pipeline/types/pipeline.types'

describe('PipelineBoard Component', () => {
  const mockPipelines: Pipeline[] = [
    {
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
        firstName: 'Hal',
        lastName: 'Jordan',
      },
      job: {
        id: 'job_1',
        jobCode: 'JOB-001',
        title: 'Test Pilot',
      },
    },
    {
      id: 'pipe_2',
      companyId: 'comp_1',
      applicationId: 'app_2',
      candidateId: 'cand_2',
      recruiterId: 'usr_rec',
      jobId: 'job_1',
      currentStage: 'HR_INTERVIEW',
      stageChangedAt: '2026-03-02T00:00:00Z',
      stageOrder: 4,
      isCompleted: false,
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-02T00:00:00Z',
      candidate: {
        id: 'cand_2',
        candidateCode: 'CAN-002',
        firstName: 'John',
        lastName: 'Stewart',
      },
      job: {
        id: 'job_1',
        jobCode: 'JOB-001',
        title: 'Test Pilot',
      },
    },
  ]

  it('renders pipeline columns and places candidates in correct stage columns', () => {
    render(
      <MemoryRouter>
        <PipelineBoard pipelines={mockPipelines} />
      </MemoryRouter>
    )

    expect(screen.getByText('Hal Jordan')).toBeInTheDocument()
    expect(screen.getByText('John Stewart')).toBeInTheDocument()

    const appliedColumn = screen.getByTestId('pipeline-column-APPLIED')
    expect(appliedColumn).toHaveTextContent('Hal Jordan')
    expect(appliedColumn).not.toHaveTextContent('John Stewart')

    const hrInterviewColumn = screen.getByTestId('pipeline-column-HR_INTERVIEW')
    expect(hrInterviewColumn).toHaveTextContent('John Stewart')
    expect(hrInterviewColumn).not.toHaveTextContent('Hal Jordan')
  })

  it('renders loading skeleton when isLoading is true', () => {
    render(
      <MemoryRouter>
        <PipelineBoard pipelines={[]} isLoading={true} />
      </MemoryRouter>
    )

    expect(screen.getByTestId('pipeline-board-skeleton')).toBeInTheDocument()
  })
})
