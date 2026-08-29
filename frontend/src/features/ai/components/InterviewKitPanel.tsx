import { Card, Badge } from '@/components/ui'
import { AiBadge } from './AiBadge'
import { AiDisclaimer } from './AiDisclaimer'
import { getDifficultyVariant } from '../utils/ai-helpers'
import { HelpCircle } from 'lucide-react'
import type { InterviewAssistantResponse } from '../types'

export interface InterviewKitPanelProps {
  readonly data: InterviewAssistantResponse
}

export function InterviewKitPanel({ data }: InterviewKitPanelProps) {
  return (
    <Card
      variant="elevated"
      padding="lg"
      data-testid="interview-kit-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 600 }}>
              Tailored Interview Kit
            </h3>
            <AiBadge />
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
            Structured questions and role-specific follow-ups grounded in candidate credentials.
          </span>
        </div>

        <Badge variant="neutral" size="md">
          {data.questions.length} Question{data.questions.length === 1 ? '' : 's'}
        </Badge>
      </div>

      {/* Summary */}
      {data.overallSummary && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
            Interview Focus Strategy
          </span>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
            {data.overallSummary}
          </p>
        </div>
      )}

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {data.questions.map((q, idx) => (
          <div
            key={idx}
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
                  Q{idx + 1}
                </span>
                <Badge variant="neutral" size="sm">
                  {q.category.replace(/_/g, ' ')}
                </Badge>
              </div>

              <Badge variant={getDifficultyVariant(q.difficulty)} size="sm">
                {q.difficulty}
              </Badge>
            </div>

            {/* Question Text */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
              <HelpCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontWeight: 600, fontSize: 'var(--text-body-md)', color: 'var(--color-text-primary)' }}>
                {q.question}
              </span>
            </div>

            {/* Objective / Reason */}
            {q.reason && (
              <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', marginLeft: '24px' }}>
                <strong>Assessment Rationale: </strong>
                <span>{q.reason}</span>
              </div>
            )}

            {/* Follow-up Probes */}
            {q.followUps && q.followUps.length > 0 && (
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  marginLeft: '24px',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-surface-hover)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Recommended Follow-up Probes:
                </span>
                <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                  {q.followUps.map((fu, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>
                      {fu}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <AiDisclaimer />
    </Card>
  )
}
