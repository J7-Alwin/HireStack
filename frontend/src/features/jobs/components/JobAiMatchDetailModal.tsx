import { Link } from 'react-router-dom'
import { Dialog, Badge, Button, Spinner } from '@/components/ui'
import { AiBadge, AiDisclaimer, AiErrorState } from '@/features/ai/components'
import { useCandidateJobMatch } from '@/features/ai/hooks'
import {
  getScoreVariant,
  getRecommendationVariant,
  getRecommendationLabel,
} from '@/features/ai/utils/ai-helpers'
import { CheckCircle2, AlertTriangle, User, ExternalLink, Cpu } from 'lucide-react'

export interface JobAiMatchDetailModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly jobId: string
  readonly candidateId: string | null
}

export function JobAiMatchDetailModal({
  isOpen,
  onClose,
  jobId,
  candidateId,
}: JobAiMatchDetailModalProps) {
  const {
    data: match,
    isLoading,
    isError,
    error,
    refetch,
  } = useCandidateJobMatch(jobId, candidateId || undefined)

  if (!candidateId) return null

  const scoreVariant = match ? getScoreVariant(match.matchPercentage) : 'neutral'
  const recVariant = match ? getRecommendationVariant(match.recommendation) : 'neutral'
  const recLabel = match ? getRecommendationLabel(match.recommendation) : ''

  const dimensions = match
    ? [
        { label: 'Skill Match', value: match.skillMatch },
        { label: 'Experience Match', value: match.experienceMatch },
        { label: 'Education Match', value: match.educationMatch },
        { label: 'Project Match', value: match.projectMatch },
        { label: 'Keyword Match', value: match.keywordMatch },
      ]
    : []

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Match Analysis"
      description="Detailed AI evaluation breakdown against job requirements."
      size="lg"
    >
      <div
        data-testid="job-ai-match-detail-modal"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {isLoading && (
          <div
            data-testid="match-detail-loading"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-8)',
              gap: 'var(--space-2)',
            }}
          >
            <Spinner size="md" />
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
              Loading match breakdown...
            </span>
          </div>
        )}

        {isError && (
          <AiErrorState
            title="Unable to load match breakdown"
            error={error}
            onRetry={() => void refetch()}
          />
        )}

        {match && !isLoading && (
          <>
            {/* Top Candidate Summary Card */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: 'var(--text-body-lg)', fontWeight: 600 }}>
                      {match.candidateName}
                    </h4>
                    <AiBadge />
                  </div>
                  <Link
                    to={`/app/candidates/${match.candidateId}`}
                    style={{
                      fontSize: 'var(--text-caption)',
                      color: 'var(--color-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                      marginTop: '2px',
                    }}
                  >
                    View Full Profile <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
                    Match Score
                  </span>
                  <Badge variant={scoreVariant} size="md">
                    {match.matchPercentage}% Overall
                  </Badge>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
                    Recommendation
                  </span>
                  <Badge variant={recVariant} size="md">
                    {recLabel}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Dimensional Score Breakdown */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h5 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
                Dimensional Match Breakdown
              </h5>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                {dimensions.map((dim) => {
                  const dimVariant = getScoreVariant(dim.value)
                  return (
                    <div
                      key={dim.label}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        padding: 'var(--space-2) var(--space-3)',
                        backgroundColor: 'var(--color-surface-hover)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                          {dim.label}
                        </span>
                        <Badge variant={dimVariant} size="sm">
                          {dim.value}%
                        </Badge>
                      </div>
                      <div
                        style={{
                          height: '6px',
                          width: '100%',
                          backgroundColor: 'var(--color-border)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(Math.max(dim.value, 0), 100)}%`,
                            backgroundColor:
                              dim.value >= 80
                                ? 'var(--color-success)'
                                : dim.value >= 65
                                  ? 'var(--color-info)'
                                  : dim.value >= 45
                                    ? 'var(--color-warning)'
                                    : 'var(--color-error)',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Strengths & Missing Skills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {/* Strengths */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)' }}>
                  <CheckCircle2 size={16} />
                  <h5 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Key Strengths ({match.strengths.length})
                  </h5>
                </div>
                {match.strengths.length === 0 ? (
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    No specific strengths recorded.
                  </span>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {match.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Missing Skills */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-warning)' }}>
                  <AlertTriangle size={16} />
                  <h5 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Missing Skills & Gaps ({match.missingSkills.length})
                  </h5>
                </div>
                {match.missingSkills.length === 0 ? (
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    No significant skill gaps identified.
                  </span>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {match.missingSkills.map((gap, idx) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Overall Reasoning */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h5 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
                AI Evaluation Summary & Reasoning
              </h5>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                {match.overallReason}
              </p>
            </div>

            {/* Metadata Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: 'var(--text-caption)',
                color: 'var(--color-text-muted)',
                paddingTop: 'var(--space-2)',
                borderTop: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={13} />
                <span>
                  Model: {match.aiModel || 'local-ai'} • Prompt: v{match.promptVersion || '1.0.0'}
                </span>
              </div>
              <span>
                Generated: {new Date(match.createdAt).toLocaleString()}
              </span>
            </div>

            <AiDisclaimer />
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
