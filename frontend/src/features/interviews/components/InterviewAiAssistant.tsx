import { useState } from 'react'
import { Card, Button, Badge } from '@/components/ui'
import {
  AiBadge,
  AiDisclaimer,
  AiLoadingState,
  AiErrorState,
  InterviewKitPanel,
} from '@/features/ai/components'
import {
  useInterviewAssistantHistory,
  useCreateInterviewAssistant,
  useCreateJobInterviewAssistant,
} from '@/features/ai/hooks'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import {
  Sparkles,
  Clock,
  Briefcase,
  User,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { InterviewAssistantResponse } from '@/features/ai/types'

export interface InterviewAiAssistantProps {
  readonly candidateId?: string
  readonly jobId?: string
  readonly candidateName?: string
  readonly jobTitle?: string
  readonly applicationId?: string
}

export function InterviewAiAssistant({
  candidateId,
  jobId,
  candidateName = 'Candidate',
  jobTitle,
  applicationId,
}: InterviewAiAssistantProps) {
  const { user } = useAuth()
  const isAuthorized =
    user?.role === Role.COMPANY_ADMIN || user?.role === Role.RECRUITER

  const [selectedKitId, setSelectedKitId] = useState<string | null>(null)
  const [latestGeneratedKit, setLatestGeneratedKit] =
    useState<InterviewAssistantResponse | null>(null)

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
    error: historyError,
    refetch: refetchHistory,
  } = useInterviewAssistantHistory(candidateId)

  const generalMutation = useCreateInterviewAssistant()
  const jobMutation = useCreateJobInterviewAssistant()

  if (!isAuthorized) {
    return null
  }

  if (!candidateId) {
    return (
      <Card
        variant="elevated"
        padding="lg"
        data-testid="interview-ai-assistant-section"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 600 }}>
            AI Interview Assistant
          </h3>
          <AiBadge />
        </div>
        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
          Candidate information is required to generate interview questions and evaluation guidance.
        </p>
      </Card>
    )
  }

  const isGenerating = generalMutation.isPending || jobMutation.isPending
  const mutationError = generalMutation.error || jobMutation.error

  const handleGenerateJobSpecific = async () => {
    if (!candidateId || !jobId) return
    try {
      const res = await jobMutation.mutateAsync({ candidateId, jobId })
      setLatestGeneratedKit(res)
      setSelectedKitId(res.id)
    } catch {
      // Error handled by mutation state
    }
  }

  const handleGenerateGeneral = async () => {
    if (!candidateId) return
    try {
      const res = await generalMutation.mutateAsync({ candidateId })
      setLatestGeneratedKit(res)
      setSelectedKitId(res.id)
    } catch {
      // Error handled by mutation state
    }
  }

  const historyKits = historyData?.history || []
  const activeKit: InterviewAssistantResponse | null =
    selectedKitId
      ? historyKits.find((k) => k.id === selectedKitId) ||
        (latestGeneratedKit?.id === selectedKitId ? latestGeneratedKit : null) ||
        historyKits[0] ||
        latestGeneratedKit
      : latestGeneratedKit || historyKits[0] || null

  const hasHistory = historyKits.length > 0 || Boolean(latestGeneratedKit)

  return (
    <div
      data-testid="interview-ai-assistant-section"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
    >
      {/* Header card with action bar */}
      <Card variant="elevated" padding="lg">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 600 }}>
                AI Interview Assistant
              </h3>
              <AiBadge />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Generate structured, evidence-grounded interview kits, tailored question sets, and assessment rationales for {candidateName}.
            </p>
          </div>

          {/* Action triggers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {jobId && (
              <Button
                variant={hasHistory ? 'outline' : 'primary'}
                size="sm"
                onClick={handleGenerateJobSpecific}
                disabled={isGenerating}
                iconLeft={<Sparkles size={14} />}
                data-testid="generate-job-interview-btn"
              >
                {hasHistory ? 'Regenerate Role Kit' : 'Prepare Role-Specific Kit'}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateGeneral}
              disabled={isGenerating}
              iconLeft={jobId ? undefined : <Sparkles size={14} />}
              data-testid="generate-general-interview-btn"
            >
              {hasHistory ? 'Regenerate General Kit' : 'Prepare General Kit'}
            </Button>
          </div>
        </div>

        {/* Historical version selector if multiple exist */}
        {historyKits.length > 1 && (
          <div
            style={{
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Historical Kits ({historyKits.length}):
            </span>
            {historyKits.map((kit, index) => {
              const isSelected = activeKit?.id === kit.id
              return (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => setSelectedKitId(kit.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    fontSize: 'var(--text-caption)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-surface-hover)' : 'transparent',
                    color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                  data-testid={`history-kit-tab-${index}`}
                >
                  <Clock size={11} />
                  <span>
                    #{index + 1} {kit.mode === 'JOB_SPECIFIC' ? 'Role' : 'General'} ({new Date(kit.createdAt).toLocaleDateString()})
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </Card>

      {/* Loading state */}
      {isGenerating && (
        <AiLoadingState
          title="Generating Interview Guidance"
          description="Synthesizing candidate background and role competencies to generate tailored interview questions and follow-up probes..."
        />
      )}

      {/* Mutation error state */}
      {!isGenerating && mutationError && (
        <AiErrorState
          title="Interview Kit Generation Failed"
          error={mutationError}
          onRetry={() => {
            if (jobId) {
              void handleGenerateJobSpecific()
            } else {
              void handleGenerateGeneral()
            }
          }}
        />
      )}

      {/* Query error state */}
      {!isGenerating && !mutationError && isHistoryError && (
        <AiErrorState
          title="Failed to Load Interview History"
          error={historyError}
          onRetry={() => void refetchHistory()}
        />
      )}

      {/* Active kit presentation */}
      {!isGenerating && !mutationError && activeKit && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Metadata banner */}
          <div
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Badge variant="neutral" size="sm">
                Mode: {activeKit.mode === 'JOB_SPECIFIC' ? 'Role-Specific' : 'General'}
              </Badge>
              {activeKit.createdAt && (
                <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  Generated {new Date(activeKit.createdAt).toLocaleString()}
                </span>
              )}
            </div>

            {/* Quick Context Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Link
                to={`/app/candidates/${candidateId}`}
                style={{
                  fontSize: 'var(--text-caption)',
                  color: 'var(--color-text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                }}
              >
                <User size={12} />
                Candidate Profile
                <ExternalLink size={10} />
              </Link>
              {jobId && (
                <Link
                  to={`/app/jobs/${jobId}`}
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                  }}
                >
                  <Briefcase size={12} />
                  {jobTitle || 'Job Requisition'}
                  <ExternalLink size={10} />
                </Link>
              )}
              {applicationId && (
                <Link
                  to={`/app/applications/${applicationId}`}
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                  }}
                >
                  <FileText size={12} />
                  Application
                  <ExternalLink size={10} />
                </Link>
              )}
            </div>
          </div>

          <InterviewKitPanel data={activeKit} />
        </div>
      )}

      {/* Pre-generation empty state */}
      {!isGenerating && !mutationError && !activeKit && !isLoadingHistory && (
        <Card
          variant="elevated"
          padding="lg"
          data-testid="interview-ai-empty-state"
          style={{
            textAlign: 'center',
            padding: 'var(--space-8) var(--space-6)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface-hover)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <Sparkles size={24} />
          </div>

          <h4
            style={{
              margin: '0 0 var(--space-2) 0',
              fontSize: 'var(--text-h4)',
              fontWeight: 600,
            }}
          >
            No AI Interview Guidance Generated Yet
          </h4>
          <p
            style={{
              margin: '0 auto var(--space-6) auto',
              maxWidth: '520px',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            Generate tailored technical, behavioral, and role-competency questions with rationale and follow-up probes grounded in {candidateName}’s verified resume credentials.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}
          >
            {jobId && (
              <Button
                variant="primary"
                onClick={handleGenerateJobSpecific}
                iconLeft={<Sparkles size={16} />}
              >
                Prepare Role-Specific Interview Kit
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleGenerateGeneral}
              iconLeft={jobId ? undefined : <Sparkles size={16} />}
            >
              Prepare General Interview Kit
            </Button>
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <AiDisclaimer />
          </div>
        </Card>
      )}
    </div>
  )
}
