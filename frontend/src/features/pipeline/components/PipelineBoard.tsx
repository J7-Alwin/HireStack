import { Skeleton } from '@/components/ui'
import { PipelineColumn } from './PipelineColumn'
import {
  STAGE_COLUMN_DEFINITIONS,
  groupPipelinesByStage,
} from '../utils/pipeline-helpers'
import type { Pipeline, PipelineStage } from '../types/pipeline.types'

export interface PipelineBoardProps {
  readonly pipelines: readonly Pipeline[]
  readonly isLoading?: boolean
  readonly visibleStages?: readonly PipelineStage[]
  readonly onMove?: (pipeline: Pipeline) => void
  readonly onViewHistory?: (pipeline: Pipeline) => void
}

export function PipelineBoard({
  pipelines,
  isLoading = false,
  visibleStages,
  onMove,
  onViewHistory,
}: PipelineBoardProps) {
  const grouped = groupPipelinesByStage(pipelines)

  const columnsToRender = visibleStages
    ? STAGE_COLUMN_DEFINITIONS.filter((d) => visibleStages.includes(d.stage))
    : STAGE_COLUMN_DEFINITIONS

  if (isLoading) {
    return (
      <div
        data-testid="pipeline-board-skeleton"
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-4)',
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              minWidth: '280px',
              maxWidth: '320px',
              flex: '1 0 280px',
              height: '480px',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <Skeleton height="32px" />
            <Skeleton height="120px" />
            <Skeleton height="120px" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      data-testid="pipeline-board"
      style={{
        display: 'flex',
        gap: 'var(--space-4)',
        overflowX: 'auto',
        paddingBottom: 'var(--space-4)',
        width: '100%',
        alignItems: 'flex-start',
      }}
    >
      {columnsToRender.map((def) => (
        <PipelineColumn
          key={def.stage}
          definition={def}
          pipelines={grouped[def.stage] || []}
          onMove={onMove}
          onViewHistory={onViewHistory}
        />
      ))}
    </div>
  )
}
