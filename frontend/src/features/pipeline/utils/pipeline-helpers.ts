import type { PipelineStage, Pipeline, StageColumnDefinition } from '../types/pipeline.types'
import type { BadgeVariant } from '@/components/ui'

export const STAGE_ORDER: Record<PipelineStage, number> = {
  APPLIED: 1,
  SCREENING: 2,
  SHORTLISTED: 3,
  HR_INTERVIEW: 4,
  TECHNICAL_INTERVIEW: 5,
  FINAL_INTERVIEW: 6,
  OFFER_PENDING: 7,
  OFFER_SENT: 8,
  OFFER_ACCEPTED: 9,
  HIRED: 10,
  REJECTED: 11,
  WITHDRAWN: 12,
}

export const ACTIVE_PIPELINE_STAGES: readonly PipelineStage[] = [
  'APPLIED',
  'SCREENING',
  'SHORTLISTED',
  'HR_INTERVIEW',
  'TECHNICAL_INTERVIEW',
  'FINAL_INTERVIEW',
  'OFFER_PENDING',
  'OFFER_SENT',
  'OFFER_ACCEPTED',
]

export const TERMINAL_PIPELINE_STAGES: readonly PipelineStage[] = [
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
]

export const ALL_PIPELINE_STAGES: readonly PipelineStage[] = [
  ...ACTIVE_PIPELINE_STAGES,
  ...TERMINAL_PIPELINE_STAGES,
]

export const STAGE_COLUMN_DEFINITIONS: readonly StageColumnDefinition[] = [
  { stage: 'APPLIED', label: 'Applied', order: 1 },
  { stage: 'SCREENING', label: 'Screening', order: 2 },
  { stage: 'SHORTLISTED', label: 'Shortlisted', order: 3 },
  { stage: 'HR_INTERVIEW', label: 'HR Interview', order: 4 },
  { stage: 'TECHNICAL_INTERVIEW', label: 'Technical Interview', order: 5 },
  { stage: 'FINAL_INTERVIEW', label: 'Final Interview', order: 6 },
  { stage: 'OFFER_PENDING', label: 'Offer Pending', order: 7 },
  { stage: 'OFFER_SENT', label: 'Offer Sent', order: 8 },
  { stage: 'OFFER_ACCEPTED', label: 'Offer Accepted', order: 9 },
  { stage: 'HIRED', label: 'Hired', order: 10, isTerminal: true, isSuccess: true },
  { stage: 'REJECTED', label: 'Rejected', order: 11, isTerminal: true, isFailure: true },
  { stage: 'WITHDRAWN', label: 'Withdrawn', order: 12, isTerminal: true, isFailure: true },
]

export const ALLOWED_SEQUENTIAL_TRANSITIONS: Record<PipelineStage, readonly PipelineStage[]> = {
  APPLIED: ['SCREENING', 'REJECTED', 'WITHDRAWN'],
  SCREENING: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['HR_INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  HR_INTERVIEW: ['TECHNICAL_INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  TECHNICAL_INTERVIEW: ['FINAL_INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  FINAL_INTERVIEW: ['OFFER_PENDING', 'REJECTED', 'WITHDRAWN'],
  OFFER_PENDING: ['OFFER_SENT', 'REJECTED', 'WITHDRAWN'],
  OFFER_SENT: ['OFFER_ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  OFFER_ACCEPTED: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
}

export function getStageLabel(stage?: PipelineStage | null): string {
  if (!stage) return '—'
  const def = STAGE_COLUMN_DEFINITIONS.find((d) => d.stage === stage)
  if (def) return def.label
  return stage
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function getStageVariant(stage?: PipelineStage | null): BadgeVariant {
  if (!stage) return 'neutral'
  switch (stage) {
    case 'HIRED':
    case 'OFFER_ACCEPTED':
      return 'success'
    case 'REJECTED':
      return 'error'
    case 'WITHDRAWN':
      return 'neutral'
    case 'OFFER_PENDING':
    case 'OFFER_SENT':
      return 'warning'
    case 'HR_INTERVIEW':
    case 'TECHNICAL_INTERVIEW':
    case 'FINAL_INTERVIEW':
      return 'info'
    case 'SHORTLISTED':
    case 'SCREENING':
      return 'accent'
    case 'APPLIED':
    default:
      return 'neutral'
  }
}

export function isTerminalStage(stage?: PipelineStage | null): boolean {
  if (!stage) return false
  return TERMINAL_PIPELINE_STAGES.includes(stage)
}

export function getAllowedTransitions(
  currentStage: PipelineStage,
  isOverride = false
): readonly PipelineStage[] {
  if (isOverride) {
    return ALL_PIPELINE_STAGES.filter((s) => s !== currentStage)
  }
  return ALLOWED_SEQUENTIAL_TRANSITIONS[currentStage] || []
}

export function groupPipelinesByStage(
  pipelines: readonly Pipeline[]
): Record<PipelineStage, Pipeline[]> {
  const groups: Record<PipelineStage, Pipeline[]> = {
    APPLIED: [],
    SCREENING: [],
    SHORTLISTED: [],
    HR_INTERVIEW: [],
    TECHNICAL_INTERVIEW: [],
    FINAL_INTERVIEW: [],
    OFFER_PENDING: [],
    OFFER_SENT: [],
    OFFER_ACCEPTED: [],
    HIRED: [],
    REJECTED: [],
    WITHDRAWN: [],
  }

  for (const item of pipelines) {
    if (groups[item.currentStage]) {
      groups[item.currentStage].push(item)
    }
  }

  return groups
}
