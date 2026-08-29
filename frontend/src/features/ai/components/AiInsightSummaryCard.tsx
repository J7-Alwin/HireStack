import { Card, Badge } from '@/components/ui'
import { AiBadge } from './AiBadge'
import { AiDisclaimer } from './AiDisclaimer'
import { getScoreVariant } from '../utils/ai-helpers'
import { ShieldAlert, CheckCircle2, AlertTriangle, Target } from 'lucide-react'
import type { AiInsightResponse } from '../types'

export interface AiInsightSummaryCardProps {
  readonly data: AiInsightResponse
}

export function AiInsightSummaryCard({ data }: AiInsightSummaryCardProps) {
  const confidenceVariant = getScoreVariant(data.hiringConfidence)

  return (
    <Card
      variant="elevated"
      padding="lg"
      data-testid="ai-insight-summary-card"
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
              Recruiter AI Insights & Risk Analysis
            </h3>
            <AiBadge />
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
            Holistic synthesis of candidate background, role alignment, and hiring considerations.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', display: 'block' }}>
              Hiring Confidence
            </span>
            <span
              style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 700,
                color: confidenceVariant === 'success' ? 'var(--color-success)' : 'var(--color-text-primary)',
              }}
            >
              {data.hiringConfidence}%
            </span>
          </div>

          <Badge variant={confidenceVariant} size="md">
            {data.recommendation || 'Evaluated'}
          </Badge>
        </div>
      </div>

      {/* Overall Insight */}
      {data.overallInsight && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-warm-white-subtle)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
            Executive Synthesis
          </span>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            {data.overallInsight}
          </p>
        </div>
      )}

      {/* Grid of Findings */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Key Strengths */}
        {data.strengths && data.strengths.length > 0 && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
                Core Strengths
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              {data.strengths.map((s, i) => (
                <li key={i} style={{ marginBottom: '3px' }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hiring Risks & Concerns */}
        {data.hiringRisks && data.hiringRisks.length > 0 && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
              <ShieldAlert size={16} style={{ color: 'var(--color-error)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
                Hiring Risks & Caveats
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              {data.hiringRisks.map((r, i) => (
                <li key={i} style={{ marginBottom: '3px' }}>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recruiter Focus Areas */}
        {data.recruiterFocusAreas && data.recruiterFocusAreas.length > 0 && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
              <Target size={16} style={{ color: 'var(--color-info)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
                Recruiter Follow-up Focus Areas
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              {data.recruiterFocusAreas.map((f, i) => (
                <li key={i} style={{ marginBottom: '3px' }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skill Gaps */}
        {data.skillGaps && data.skillGaps.length > 0 && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
              <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
                Identified Skill Gaps
              </h4>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {data.skillGaps.map((sg, i) => (
                <Badge key={i} variant="warning" size="sm">
                  {sg}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <AiDisclaimer />
    </Card>
  )
}
