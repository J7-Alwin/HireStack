import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import {
  AiBadge,
  AiDisclaimer,
  AiLoadingState,
  AiErrorState,
  JobMatchRankingTable,
} from '@/features/ai/components'
import { useJobMatches, useGenerateJobMatching } from '@/features/ai/hooks'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import { Sparkles, RefreshCw, Users, Clock } from 'lucide-react'
import { JobAiMatchDetailModal } from './JobAiMatchDetailModal'
import type { CandidateMatchResponse } from '@/features/ai/types'

export interface JobAiMatchingProps {
  readonly jobId: string
}

export function JobAiMatching({ jobId }: JobAiMatchingProps) {
  const { user } = useAuth()
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const {
    data: historyData,
    isError: isHistoryError,
    error: historyError,
  } = useJobMatches(jobId)

  const generateMutation = useGenerateJobMatching()

  // SUPER_ADMIN and CANDIDATE are forbidden from recruiter/company-scoped job applicant ranking
  if (user?.role === Role.SUPER_ADMIN || user?.role === Role.CANDIDATE) {
    return null
  }

  const isGenerating = generateMutation.isPending
  const isError = generateMutation.isError || (isHistoryError && !generateMutation.data)
  const activeError = generateMutation.error || historyError

  // Determine active matches
  const freshMatches = generateMutation.data?.matches
  const historyMatches: CandidateMatchResponse[] = (historyData || []).map((h) => ({
    candidateId: h.candidateId,
    candidateName: h.candidateName || 'Applicant',
    matchPercentage: h.matchPercentage,
    recommendation: h.recommendation,
  }))

  const activeMatches: readonly CandidateMatchResponse[] =
    freshMatches ?? (historyMatches.length > 0 ? historyMatches : [])

  const hasMatches = activeMatches.length > 0
  const isViewingHistory = !freshMatches && historyMatches.length > 0
  const historyTimestamp = historyData && historyData.length > 0 ? historyData[0].createdAt : null
  const generatedAt = generateMutation.data?.generatedAt || historyTimestamp

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync({ jobId })
    } catch {
      // Handled by mutation error state
    }
  }

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId)
    setIsDetailOpen(true)
  }

  return (
    <Card
      variant="elevated"
      padding="lg"
      data-testid="job-ai-matching-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--color-surface)',
        width: '100%',
      }}
    >
      {/* Header Container */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 600 }}>
              AI Applicant Matching & Ranking
            </h3>
            <AiBadge />
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
            Advisory evaluation ranking applicants against this job requisition's requirements, qualifications, and skills.
          </span>
        </div>

        {/* Top Action Button */}
        {hasMatches && !isGenerating && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            iconLeft={<RefreshCw size={14} />}
            disabled={isGenerating}
            data-testid="regenerate-matches-button"
          >
            Regenerate Matches
          </Button>
        )}
      </div>

      {/* Historical Notice */}
      {isViewingHistory && generatedAt && !isGenerating && !isError && (
        <div
          data-testid="historical-match-notice"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            fontSize: 'var(--text-caption)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} style={{ color: 'var(--color-primary)' }} />
            <span>
              Previous AI applicant matching analysis generated on{' '}
              <strong>{new Date(generatedAt).toLocaleString()}</strong>.
            </span>
          </div>
          <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
            Advisory records reflect evaluation at generation time.
          </span>
        </div>
      )}

      {/* Loading State during matching */}
      {isGenerating && (
        <AiLoadingState
          title="Analyzing applicants against this role..."
          description="Evaluating applicant qualifications, skills, experience, and keyword alignment against the job requisition. This may take several seconds."
        />
      )}

      {/* Error State */}
      {isError && !isGenerating && (
        <AiErrorState
          title="AI Applicant Matching Failed"
          error={activeError}
          onRetry={handleGenerate}
        />
      )}

      {/* Results Ranking Table */}
      {hasMatches && !isGenerating && !isError && (
        <JobMatchRankingTable
          matches={activeMatches}
          onSelectCandidate={handleSelectCandidate}
        />
      )}

      {/* Zero Results post-generation */}
      {generateMutation.data && generateMutation.data.matches.length === 0 && !isGenerating && (
        <div
          data-testid="no-applicants-empty-state"
          style={{
            padding: 'var(--space-8) var(--space-4)',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
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
              backgroundColor: 'var(--color-surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Users size={22} />
          </div>

          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: 'var(--text-body-md)', fontWeight: 600 }}>
              No Applicants Evaluated
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                maxWidth: '440px',
              }}
            >
              No candidate applicants were found for this job requisition to evaluate.
            </p>
          </div>
        </div>
      )}

      {/* Initial Empty State before generation & no history */}
      {!hasMatches && !isGenerating && !isError && !generateMutation.data && (
        <div
          data-testid="job-ai-matching-empty-state"
          style={{
            padding: 'var(--space-8) var(--space-4)',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <Sparkles size={24} />
          </div>

          <div style={{ maxWidth: '480px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: 'var(--text-h4)', fontWeight: 600 }}>
              No AI Applicant Analysis Generated Yet
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              Trigger AI applicant matching to rank and evaluate all candidate applicants against this job requisition's required skills, experience, and role alignment.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleGenerate}
            iconLeft={<Sparkles size={16} />}
            data-testid="generate-matches-button"
          >
            Generate Applicant Matches
          </Button>

          <div style={{ marginTop: 'var(--space-2)' }}>
            <AiDisclaimer />
          </div>
        </div>
      )}

      {/* Candidate Match Detail Modal */}
      <JobAiMatchDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedCandidateId(null)
        }}
        jobId={jobId}
        candidateId={selectedCandidateId}
      />
    </Card>
  )
}
