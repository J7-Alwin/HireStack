import { Card, Badge } from '@/components/ui'
import { AiBadge } from './AiBadge'
import { AiDisclaimer } from './AiDisclaimer'
import { getPriorityVariant } from '../utils/ai-helpers'
import type { ResumeRecommendationResponse } from '../types'

export interface ResumeRecommendationListProps {
  readonly data: ResumeRecommendationResponse
}

export function ResumeRecommendationList({ data }: ResumeRecommendationListProps) {
  return (
    <Card
      variant="elevated"
      padding="lg"
      data-testid="resume-recommendation-list"
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
              Resume Optimization Recommendations
            </h3>
            <AiBadge />
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
            Mode: {data.mode === 'JOB_SPECIFIC' ? 'Role-Targeted Optimization' : 'General Resume Review'}
          </span>
        </div>

        <Badge variant="neutral" size="md">
          {data.recommendations.length} Action Item{data.recommendations.length === 1 ? '' : 's'}
        </Badge>
      </div>

      {/* Overall Summary */}
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
            Executive Review
          </span>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
            {data.overallSummary}
          </p>
        </div>
      )}

      {/* Recommendations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {data.recommendations.map((item, idx) => (
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
            {/* Header: Category & Priority */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--text-body-sm)' }}>
                {item.category.replace(/_/g, ' ')}
              </span>
              <Badge variant={getPriorityVariant(item.priority)} size="sm">
                {item.priority} Priority
              </Badge>
            </div>

            {/* Current Issue */}
            <div style={{ fontSize: 'var(--text-body-sm)' }}>
              <strong style={{ color: 'var(--color-text-secondary)' }}>Observation: </strong>
              <span>{item.currentIssue}</span>
            </div>

            {/* Recommendation */}
            <div style={{ fontSize: 'var(--text-body-sm)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>Action Item: </strong>
              <span>{item.recommendation}</span>
            </div>

            {/* Expected Improvement */}
            {item.expectedImprovement && (
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
                <em>Expected Impact: {item.expectedImprovement}</em>
              </div>
            )}
          </div>
        ))}
      </div>

      <AiDisclaimer />
    </Card>
  )
}
