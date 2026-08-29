import { Card } from '@/components/ui'
import { formatPipelineStage, formatNumber } from '../utils'

export interface PipelineStageBreakdownProps {
  readonly stageBreakdown?: Record<string, number>
  readonly totalActive?: number
  readonly title?: string
}

const STAGES_ORDER = [
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

const STAGE_COLORS: Record<string, string> = {
  APPLIED: '#94938f',
  SCREENING: '#575653',
  SHORTLISTED: '#1d4ed8',
  HR_INTERVIEW: '#6366f1',
  TECHNICAL_INTERVIEW: '#8b5cf6',
  FINAL_INTERVIEW: '#a855f7',
  OFFER_PENDING: '#b45309',
  OFFER_SENT: '#d97706',
  OFFER_ACCEPTED: '#15803d',
}

export function PipelineStageBreakdown({
  stageBreakdown = {},
  totalActive,
  title = 'Active Pipeline Distribution',
}: PipelineStageBreakdownProps) {
  const activeEntries = STAGES_ORDER.map((stage) => ({
    stage,
    label: formatPipelineStage(stage),
    count: stageBreakdown[stage] ?? 0,
    color: STAGE_COLORS[stage] ?? 'var(--color-charcoal)',
  })).filter((item) => item.count > 0)

  const computedTotal =
    totalActive ?? activeEntries.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <Card
      variant="elevated"
      padding="lg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        width: '100%',
        boxSizing: 'border-box',
      }}
      className="hs-pipeline-breakdown"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--text-h4)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h3>
        <span
          style={{
            fontSize: 'var(--text-caption)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          {formatNumber(computedTotal)} Active Candidates
        </span>
      </div>

      {computedTotal === 0 ? (
        <div
          style={{
            padding: 'var(--space-6) 0',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-body-sm)',
          }}
        >
          No active candidates in pipeline stages currently.
        </div>
      ) : (
        <>
          {/* Progress Distribution Bar */}
          <div
            style={{
              display: 'flex',
              height: '10px',
              width: '100%',
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden',
              backgroundColor: 'var(--color-warm-white-subtle)',
              gap: '2px',
            }}
            role="progressbar"
            aria-valuenow={computedTotal}
            aria-valuemin={0}
            aria-valuemax={computedTotal}
            aria-label="Hiring pipeline stage distribution"
          >
            {activeEntries.map((entry) => {
              const percentage = Math.max(
                (entry.count / computedTotal) * 100,
                3
              )
              return (
                <div
                  key={entry.stage}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: entry.color,
                    borderRadius: '2px',
                    transition: 'width var(--transition-normal)',
                  }}
                  title={`${entry.label}: ${entry.count}`}
                />
              )
            })}
          </div>

          {/* Stage Badges Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginTop: '4px',
            }}
          >
            {activeEntries.map((entry) => (
              <div
                key={entry.stage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  backgroundColor: 'var(--color-warm-white-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {entry.label}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-body-sm)',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {formatNumber(entry.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
