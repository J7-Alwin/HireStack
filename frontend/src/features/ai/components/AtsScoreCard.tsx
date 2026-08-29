import { Card, Badge } from '@/components/ui'
import { AiBadge } from './AiBadge'
import { AiDisclaimer } from './AiDisclaimer'
import {
  getScoreVariant,
  getRecommendationVariant,
  getRecommendationLabel,
} from '../utils/ai-helpers'
import type { ATSScoreResponse } from '../types'

export interface AtsScoreCardProps {
  readonly score: ATSScoreResponse
}

export function AtsScoreCard({ score }: AtsScoreCardProps) {
  const overallVariant = getScoreVariant(score.overallScore)
  const recVariant = getRecommendationVariant(score.hiringRecommendation)
  const recLabel = getRecommendationLabel(score.hiringRecommendation)

  const dimensions = [
    { label: 'Skills Alignment', score: score.skillScore },
    { label: 'Experience Depth', score: score.experienceScore },
    { label: 'Education Match', score: score.educationScore },
    { label: 'Keyword Relevance', score: score.keywordScore },
    { label: 'Certifications', score: score.certificationScore },
  ]

  return (
    <Card
      variant="elevated"
      padding="lg"
      data-testid="ats-score-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Header with Title, Badge, and Recommendation */}
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
              ATS Candidate Match Score
            </h3>
            <AiBadge />
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
            Evaluated against target role requirements and candidate credentials.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', display: 'block' }}>
              Overall Score
            </span>
            <span
              style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 700,
                color: overallVariant === 'success' ? 'var(--color-success)' : 'var(--color-text-primary)',
              }}
            >
              {score.overallScore}%
            </span>
          </div>
          <Badge variant={recVariant} size="md">
            {recLabel}
          </Badge>
        </div>
      </div>

      {/* 5 Dimension Progress Meters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {dimensions.map((dim) => (
          <div
            key={dim.label}
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {dim.label}
              </span>
              <span style={{ fontSize: 'var(--text-caption)', fontWeight: 700 }}>
                {dim.score}%
              </span>
            </div>
            {/* Meter Bar */}
            <div
              style={{
                height: '6px',
                width: '100%',
                backgroundColor: 'var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(Math.max(dim.score, 0), 100)}%`,
                  backgroundColor:
                    dim.score >= 80
                      ? 'var(--color-success)'
                      : dim.score >= 60
                      ? 'var(--color-info)'
                      : 'var(--color-warning)',
                  borderRadius: 'var(--radius-pill)',
                  transition: 'width var(--transition-normal)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Overall Reason Summary */}
      {score.overallReason && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-warm-white-subtle)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
            Evaluation Summary
          </span>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
            {score.overallReason}
          </p>
        </div>
      )}

      {/* Strengths & Weaknesses Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Strengths */}
        {score.strengths && score.strengths.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-success-text)' }}>
              Identified Strengths
            </h4>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
              {score.strengths.map((st, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  {st}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Skills / Weaknesses */}
        {score.missingSkills && score.missingSkills.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-warning-text)' }}>
              Missing Required Skills
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {score.missingSkills.map((sk, i) => (
                <Badge key={i} variant="warning" size="sm">
                  {sk}
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
