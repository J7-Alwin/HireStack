import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import {
  useCreateAiInsights,
  useAiInsightHistory,
  useAiInsight,
} from '@/features/ai/hooks'
import {
  AiBadge,
  AiDisclaimer,
  AiLoadingState,
  AiErrorState,
} from '@/features/ai/components'
import { getScoreVariant } from '@/features/ai/utils/ai-helpers'
import {
  Sparkles,
  Brain,
  History,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Target,
  User,
  Briefcase,
  Layers,
  FileSearch,
  RotateCw,
} from 'lucide-react'
import type { AiInsightResponse } from '@/features/ai/types'

export interface ApplicationAiInsightsProps {
  readonly candidateId: string
  readonly jobId: string
  readonly candidateName?: string
  readonly jobTitle?: string
}

export function ApplicationAiInsights({
  candidateId,
  jobId,
  candidateName,
  jobTitle,
}: ApplicationAiInsightsProps) {
  const { user } = useAuth()
  const isAllowed = user?.role === Role.COMPANY_ADMIN || user?.role === Role.RECRUITER

  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)

  const { data: historyData } = useAiInsightHistory(candidateId)
  const { data: activeDetail } = useAiInsight(selectedHistoryId || undefined)

  const insightsMutation = useCreateAiInsights()

  if (!isAllowed) {
    return null
  }

  const isPending = insightsMutation.isPending
  const mutationError = insightsMutation.error

  const historyItems = historyData || []

  // Active insight resolution: freshly generated insight, or selected history detail, or first relevant history item if any
  const activeInsight: AiInsightResponse | null =
    insightsMutation.data || activeDetail || null

  const handleGenerate = async () => {
    setSelectedHistoryId(null)
    try {
      await insightsMutation.mutateAsync({
        candidateId,
        jobId,
      })
    } catch {
      // Handled by mutation error state
    }
  }

  const confidenceVariant = activeInsight
    ? getScoreVariant(activeInsight.hiringConfidence)
    : 'neutral'

  return (
    <Card
      variant="elevated"
      padding="lg"
      data-testid="application-ai-insights-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 600 }}>
              Recruiter Workflow Intelligence & Insights
            </h3>
            <AiBadge />
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
            Holistic role fit, risk factors, competency synthesis, and decision support for this application.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {activeInsight && (
            <>
              <div style={{ textAlign: 'right', marginRight: 'var(--space-2)' }}>
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
                  {activeInsight.hiringConfidence}%
                </span>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={handleGenerate}
                disabled={isPending}
                iconLeft={<RotateCw size={15} className={isPending ? 'animate-spin' : ''} />}
              >
                {isPending ? 'Regenerating...' : 'Regenerate Insights'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* History Selector */}
      {historyItems.length > 0 && (
        <div
          data-testid="ai-insights-history-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            fontSize: 'var(--text-caption)',
          }}
        >
          <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <History size={13} />
            Evaluations History:
          </span>

          {historyItems.map((h, index) => {
            const isCurrentActive =
              (selectedHistoryId === h.id) ||
              (!selectedHistoryId && !insightsMutation.data && index === 0 && activeDetail?.id === h.id)

            return (
              <Button
                key={h.id}
                variant={isCurrentActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedHistoryId(h.id)}
                style={{ fontSize: 'var(--text-caption)', padding: '2px 8px' }}
                aria-pressed={isCurrentActive}
              >
                {h.recommendation || 'Evaluation'} • {h.hiringConfidence}% ({new Date(h.createdAt).toLocaleDateString()})
              </Button>
            )
          })}
        </div>
      )}

      {/* Loading State */}
      {isPending && (
        <AiLoadingState
          title="Synthesizing Recruiter AI Insights..."
          description="Evaluating holistic profile credentials, domain alignment, hiring risks, confidence, and structured interview focus probes."
        />
      )}

      {/* Error State */}
      {mutationError && (
        <AiErrorState
          title="AI Insights Generation Failed"
          error={mutationError}
          onRetry={handleGenerate}
        />
      )}

      {/* Active Insight Results */}
      {activeInsight && !isPending && (
        <div
          data-testid="ai-insight-results"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {/* Recommendation & Executive Synthesis Callout */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-warm-white-subtle)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--color-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Executive Recruiter Synthesis & Advisory Verdict
              </span>
              <Badge variant={confidenceVariant} size="md">
                {activeInsight.recommendation || 'Evaluated'}
              </Badge>
            </div>

            {activeInsight.overallInsight && (
              <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                {activeInsight.overallInsight}
              </p>
            )}
          </div>

          {/* Grid of Synthesized Findings */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {/* Core Strengths */}
            {activeInsight.strengths && activeInsight.strengths.length > 0 && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-hover)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
                  <h4 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
                    Demonstrated Strengths
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                  {activeInsight.strengths.map((s, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hiring Risks & Caveats */}
            {activeInsight.hiringRisks && activeInsight.hiringRisks.length > 0 && (
              <div
                style={{
                  padding: 'var(--space-4)',
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
                  {activeInsight.hiringRisks.map((r, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recruiter Follow-up Focus Areas */}
            {activeInsight.recruiterFocusAreas && activeInsight.recruiterFocusAreas.length > 0 && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-hover)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
                  <Target size={16} style={{ color: 'var(--color-info)' }} />
                  <h4 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
                    Recruiter Focus Probes
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                  {activeInsight.recruiterFocusAreas.map((f, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Identified Skill Gaps */}
            {activeInsight.skillGaps && activeInsight.skillGaps.length > 0 && (
              <div
                style={{
                  padding: 'var(--space-4)',
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeInsight.skillGaps.map((sg, i) => (
                    <Badge key={i} variant="warning" size="sm">
                      {sg}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Job Fit Observations */}
            {activeInsight.jobFitObservations && activeInsight.jobFitObservations.length > 0 && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-hover)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
                  <Layers size={16} style={{ color: 'var(--color-primary)' }} />
                  <h4 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
                    Job Fit Observations
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                  {activeInsight.jobFitObservations.map((obs, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experience Concerns */}
            {activeInsight.experienceConcerns && activeInsight.experienceConcerns.length > 0 && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-hover)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
                  <FileSearch size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <h4 style={{ margin: 0, fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
                    Experience Concerns
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                  {activeInsight.experienceConcerns.map((exp, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      {exp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Context Quick Links */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-caption)',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              ATS Quick Context:
            </span>

            <Link
              to={`/app/candidates/${candidateId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <User size={13} />
              Candidate Profile {candidateName ? `(${candidateName})` : ''}
            </Link>

            <span style={{ color: 'var(--color-border)' }}>•</span>

            <Link
              to={`/app/jobs/${jobId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <Briefcase size={13} />
              Job Opening {jobTitle ? `(${jobTitle})` : ''}
            </Link>

            {activeInsight.aiModel && (
              <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: '11px' }}>
                Model: {activeInsight.aiModel} • v{activeInsight.promptVersion || '1.0'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Pre-generation Empty State */}
      {!activeInsight && !isPending && !mutationError && (
        <div
          data-testid="ai-insights-empty-state"
          style={{
            padding: 'var(--space-8) var(--space-4)',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface-hover)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <Brain size={22} />
          </div>

          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: 'var(--text-body-md)', fontWeight: 600 }}>
              No Recruiter Insights Generated For This Application
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                maxWidth: '480px',
              }}
            >
              Trigger AI synthesis to evaluate {candidateName || 'the candidate'} against {jobTitle || 'this job requisition'}. Generates hiring confidence, top strengths, potential risks, and structured focus probes.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleGenerate}
            disabled={isPending}
            iconLeft={<Sparkles size={16} />}
            style={{ marginTop: 'var(--space-2)' }}
          >
            Generate Recruiter Insights
          </Button>
        </div>
      )}

      <AiDisclaimer />
    </Card>
  )
}
