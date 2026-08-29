import { Badge } from '@/components/ui'
import { PipelineApplicationCard } from './PipelineApplicationCard'
import { getStageVariant } from '../utils/pipeline-helpers'
import type { Pipeline, StageColumnDefinition } from '../types/pipeline.types'

export interface PipelineColumnProps {
  readonly definition: StageColumnDefinition
  readonly pipelines: readonly Pipeline[]
  readonly onMove?: (pipeline: Pipeline) => void
  readonly onViewHistory?: (pipeline: Pipeline) => void
}

export function PipelineColumn({
  definition,
  pipelines,
  onMove,
  onViewHistory,
}: PipelineColumnProps) {
  const count = pipelines.length
  const variant = getStageVariant(definition.stage)

  return (
    <div
      data-testid={`pipeline-column-${definition.stage}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '280px',
        maxWidth: '320px',
        flex: '1 0 280px',
        backgroundColor: 'var(--color-surface-hover)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-subtle)',
        maxHeight: 'calc(100vh - 240px)',
        boxSizing: 'border-box',
      }}
    >
      {/* Column Header */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4
            style={{
              margin: 0,
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {definition.label}
          </h4>
        </div>

        <Badge variant={variant} size="sm">
          {count}
        </Badge>
      </div>

      {/* Column Body: Cards List */}
      <div
        style={{
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {count === 0 ? (
          <div
            style={{
              padding: 'var(--space-6) var(--space-4)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-body-sm)',
              fontStyle: 'italic',
            }}
          >
            No candidates in this stage
          </div>
        ) : (
          pipelines.map((p) => (
            <PipelineApplicationCard
              key={p.id}
              pipeline={p}
              onMove={onMove}
              onViewHistory={onViewHistory}
            />
          ))
        )}
      </div>
    </div>
  )
}
