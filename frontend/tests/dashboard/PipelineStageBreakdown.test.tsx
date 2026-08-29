import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PipelineStageBreakdown } from '@/features/dashboard/components/PipelineStageBreakdown'

describe('PipelineStageBreakdown Component', () => {
  it('renders pipeline stage distribution badges and counts', () => {
    const stageBreakdown = {
      APPLIED: 10,
      SCREENING: 5,
      TECHNICAL_INTERVIEW: 2,
    }

    render(
      <PipelineStageBreakdown
        stageBreakdown={stageBreakdown}
        totalActive={17}
      />
    )

    expect(screen.getByText('Active Pipeline Distribution')).toBeInTheDocument()
    expect(screen.getByText('17 Active Candidates')).toBeInTheDocument()
    expect(screen.getByText('Applied')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Screening')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Tech Interview')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders empty state message when no active candidates exist', () => {
    render(<PipelineStageBreakdown stageBreakdown={{}} totalActive={0} />)

    expect(
      screen.getByText('No active candidates in pipeline stages currently.')
    ).toBeInTheDocument()
  })
})
