import { Card, Badge } from '@/components/ui'
import { InterviewStatusBadge } from './InterviewStatusBadge'
import { formatDate } from '@/features/dashboard/utils'
import type { Interview } from '../types/interviews.types'
import {
  getRoundLabel,
  getInterviewTypeLabel,
  getModeLabel,
  getOutcomeLabel,
  getOutcomeVariant,
} from '../utils/interview-helpers'

export interface InterviewSummaryProps {
  readonly interview: Interview
}

export function InterviewSummary({ interview }: InterviewSummaryProps) {
  return (
    <Card variant="elevated" padding="lg">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
          Interview Summary
        </h3>
        <InterviewStatusBadge status={interview.status} size="md" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
            Interview Code
          </span>
          <span style={{ fontSize: 'var(--text-body)', fontWeight: 600 }}>
            {interview.interviewCode}
          </span>
        </div>

        <div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
            Round
          </span>
          <span style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}>
            {getRoundLabel(interview.round)}
          </span>
        </div>

        <div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
            Type
          </span>
          <span style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}>
            {getInterviewTypeLabel(interview.interviewType)}
          </span>
        </div>

        <div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
            Delivery Mode
          </span>
          <span style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}>
            {getModeLabel(interview.mode)}
          </span>
        </div>

        {interview.outcome && (
          <div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
              Final Outcome
            </span>
            <div style={{ marginTop: '2px' }}>
              <Badge variant={getOutcomeVariant(interview.outcome)} size="sm">
                {getOutcomeLabel(interview.outcome)}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {interview.resultNotes && (
        <div
          style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-background-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
            Recruiter Outcome Remarks
          </span>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', whiteSpace: 'pre-wrap' }}>
            {interview.resultNotes}
          </p>
        </div>
      )}

      {interview.cancellationReason && (
        <div
          style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-error-subtle, rgba(239, 68, 68, 0.08))',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--color-error)',
          }}
        >
          <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-error)', display: 'block', marginBottom: '2px' }}>
            Cancellation Reason
          </span>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)' }}>
            {interview.cancellationReason}
          </p>
          {interview.cancelledAt && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
              Cancelled on {formatDate(interview.cancelledAt)}
            </span>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--text-caption)',
          color: 'var(--color-text-muted)',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <span>Created: {formatDate(interview.createdAt)}</span>
        <span>Last Updated: {formatDate(interview.updatedAt)}</span>
      </div>
    </Card>
  )
}
