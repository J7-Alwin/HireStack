import { describe, it, expect } from 'vitest'
import {
  STAGE_ORDER,
  ACTIVE_PIPELINE_STAGES,
  TERMINAL_PIPELINE_STAGES,
  getStageLabel,
  getStageVariant,
  isTerminalStage,
  getAllowedTransitions,
  groupPipelinesByStage,
} from '@/features/pipeline/utils/pipeline-helpers'
import type { Pipeline } from '@/features/pipeline/types/pipeline.types'

describe('Pipeline Helpers & State Transitions', () => {
  it('maintains strict stage ordering', () => {
    expect(STAGE_ORDER.APPLIED).toBe(1)
    expect(STAGE_ORDER.SCREENING).toBe(2)
    expect(STAGE_ORDER.SHORTLISTED).toBe(3)
    expect(STAGE_ORDER.HR_INTERVIEW).toBe(4)
    expect(STAGE_ORDER.TECHNICAL_INTERVIEW).toBe(5)
    expect(STAGE_ORDER.FINAL_INTERVIEW).toBe(6)
    expect(STAGE_ORDER.OFFER_PENDING).toBe(7)
    expect(STAGE_ORDER.OFFER_SENT).toBe(8)
    expect(STAGE_ORDER.OFFER_ACCEPTED).toBe(9)
    expect(STAGE_ORDER.HIRED).toBe(10)
    expect(STAGE_ORDER.REJECTED).toBe(11)
    expect(STAGE_ORDER.WITHDRAWN).toBe(12)
  })

  it('correctly classifies terminal and active stages', () => {
    expect(isTerminalStage('HIRED')).toBe(true)
    expect(isTerminalStage('REJECTED')).toBe(true)
    expect(isTerminalStage('WITHDRAWN')).toBe(true)
    expect(isTerminalStage('APPLIED')).toBe(false)
    expect(isTerminalStage('HR_INTERVIEW')).toBe(false)

    expect(ACTIVE_PIPELINE_STAGES).toContain('APPLIED')
    expect(ACTIVE_PIPELINE_STAGES).not.toContain('HIRED')
    expect(TERMINAL_PIPELINE_STAGES).toContain('HIRED')
  })

  it('returns human-readable labels and badge variants', () => {
    expect(getStageLabel('APPLIED')).toBe('Applied')
    expect(getStageLabel('HR_INTERVIEW')).toBe('HR Interview')
    expect(getStageLabel('TECHNICAL_INTERVIEW')).toBe('Technical Interview')
    expect(getStageLabel('OFFER_ACCEPTED')).toBe('Offer Accepted')
    expect(getStageLabel(null)).toBe('—')

    expect(getStageVariant('HIRED')).toBe('success')
    expect(getStageVariant('REJECTED')).toBe('error')
    expect(getStageVariant('HR_INTERVIEW')).toBe('info')
    expect(getStageVariant('SCREENING')).toBe('accent')
    expect(getStageVariant('APPLIED')).toBe('neutral')
  })

  it('returns valid sequential transitions vs admin overrides', () => {
    // Sequential recruiter transitions
    expect(getAllowedTransitions('APPLIED', false)).toEqual([
      'SCREENING',
      'REJECTED',
      'WITHDRAWN',
    ])
    expect(getAllowedTransitions('SCREENING', false)).toEqual([
      'SHORTLISTED',
      'REJECTED',
      'WITHDRAWN',
    ])
    expect(getAllowedTransitions('FINAL_INTERVIEW', false)).toEqual([
      'OFFER_PENDING',
      'REJECTED',
      'WITHDRAWN',
    ])
    expect(getAllowedTransitions('OFFER_ACCEPTED', false)).toEqual([
      'HIRED',
      'REJECTED',
      'WITHDRAWN',
    ])
    expect(getAllowedTransitions('HIRED', false)).toEqual([])

    // Admin override allows all other stages
    const overrideFromApplied = getAllowedTransitions('APPLIED', true)
    expect(overrideFromApplied).not.toContain('APPLIED')
    expect(overrideFromApplied).toContain('FINAL_INTERVIEW')
    expect(overrideFromApplied).toContain('HIRED')
  })

  it('groups pipeline applications by current stage accurately', () => {
    const pipelines: Pipeline[] = [
      {
        id: 'p1',
        companyId: 'c1',
        applicationId: 'a1',
        candidateId: 'cand1',
        recruiterId: 'r1',
        jobId: 'j1',
        currentStage: 'APPLIED',
        stageChangedAt: '2026-03-01T00:00:00Z',
        stageOrder: 1,
        isCompleted: false,
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      },
      {
        id: 'p2',
        companyId: 'c1',
        applicationId: 'a2',
        candidateId: 'cand2',
        recruiterId: 'r1',
        jobId: 'j1',
        currentStage: 'HR_INTERVIEW',
        stageChangedAt: '2026-03-01T00:00:00Z',
        stageOrder: 4,
        isCompleted: false,
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      },
    ]

    const grouped = groupPipelinesByStage(pipelines)
    expect(grouped.APPLIED.length).toBe(1)
    expect(grouped.HR_INTERVIEW.length).toBe(1)
    expect(grouped.SHORTLISTED.length).toBe(0)
    expect(grouped.APPLIED[0].id).toBe('p1')
    expect(grouped.HR_INTERVIEW[0].id).toBe('p2')
  })
})
