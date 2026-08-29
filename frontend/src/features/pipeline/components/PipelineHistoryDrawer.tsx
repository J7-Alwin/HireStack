import { Dialog, Skeleton, Button, Badge } from '@/components/ui'
import { usePipelineHistory, usePipelineTimeline } from '../hooks'
import { getStageLabel } from '../utils/pipeline-helpers'
import { formatOfferDateTime } from '@/features/offers/utils/offer-helpers'
import { History, Activity, ArrowRight, User } from 'lucide-react'
import type { Pipeline } from '../types/pipeline.types'

export interface PipelineHistoryDrawerProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly pipeline: Pipeline | null
}

export function PipelineHistoryDrawer({
  isOpen,
  onClose,
  pipeline,
}: PipelineHistoryDrawerProps) {
  const pipelineId = pipeline?.id

  const { data: history, isLoading: isLoadingHistory } = usePipelineHistory(pipelineId)
  const { data: timeline, isLoading: isLoadingTimeline } = usePipelineTimeline(pipelineId)

  if (!pipeline) return null

  const candidateName = pipeline.candidate
    ? `${pipeline.candidate.firstName} ${pipeline.candidate.lastName}`
    : 'Candidate'

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Pipeline History & Activity — ${candidateName}`}
      description={`Audit trail and chronological transition history for application ${pipeline.application?.applicationCode || pipeline.applicationId}.`}
      size="lg"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          maxHeight: '65vh',
          overflowY: 'auto',
          paddingRight: 'var(--space-2)',
          marginTop: 'var(--space-2)',
        }}
      >
        {/* Section 1: Stage Movement History */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <History size={16} style={{ color: 'var(--color-primary)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--text-body-md)', fontWeight: 600 }}>
              Stage Movement History
            </h4>
          </div>

          {isLoadingHistory ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Skeleton height="50px" />
              <Skeleton height="50px" />
            </div>
          ) : !history || history.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)' }}>
              No stage movement records found.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {history.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface-hover)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: 'var(--text-body-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <span>{h.fromStage ? getStageLabel(h.fromStage) : 'Initiated'}</span>
                      <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <Badge variant="accent" size="sm">
                        {getStageLabel(h.toStage)}
                      </Badge>
                    </div>

                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
                      {formatOfferDateTime(h.movedAt)}
                    </span>
                  </div>

                  {h.reason && (
                    <div style={{ marginTop: '6px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>
                      <strong>Reason:</strong> {h.reason}
                    </div>
                  )}

                  {h.comments && (
                    <div style={{ marginTop: '4px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>
                      <strong>Comments:</strong> {h.comments}
                    </div>
                  )}

                  {h.movedBy && (
                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: 'var(--text-caption)' }}>
                      <User size={12} />
                      <span>Moved by: {h.movedBy.firstName || h.movedBy.name || h.movedBy.email}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Timeline Activity Events */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <Activity size={16} style={{ color: 'var(--color-info)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--text-body-md)', fontWeight: 600 }}>
              Activity Timeline
            </h4>
          </div>

          {isLoadingTimeline ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Skeleton height="40px" />
              <Skeleton height="40px" />
            </div>
          ) : !timeline || timeline.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)' }}>
              No timeline events recorded.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {timeline.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--color-primary)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: 'var(--text-body-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {t.title}
                    </span>
                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
                      {formatOfferDateTime(t.createdAt)}
                    </span>
                  </div>

                  {t.description && (
                    <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>
                      {t.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <Button variant="outline" size="md" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  )
}
