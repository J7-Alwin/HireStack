import { Badge } from '@/components/ui'
import { getStageLabel, getStageVariant } from '../utils/pipeline-helpers'
import type { PipelineStage } from '../types/pipeline.types'

export interface PipelineStageBadgeProps {
  readonly stage: PipelineStage
  readonly size?: 'sm' | 'md'
}

export function PipelineStageBadge({ stage, size = 'sm' }: PipelineStageBadgeProps) {
  return (
    <Badge variant={getStageVariant(stage)} size={size}>
      {getStageLabel(stage)}
    </Badge>
  )
}
