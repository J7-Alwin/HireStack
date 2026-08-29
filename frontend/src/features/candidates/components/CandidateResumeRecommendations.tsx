import { useState } from 'react'
import { Button, Select } from '@/components/ui'
import { useJobs } from '@/features/jobs'
import {
  useCreateResumeRecommendations,
  useCreateJobResumeRecommendations,
  useResumeRecommendationHistory,
  useResumeRecommendation,
} from '@/features/ai/hooks'
import {
  ResumeRecommendationList,
  AiLoadingState,
  AiErrorState,
  AiDisclaimer,
} from '@/features/ai/components'
import { Sparkles, FileText, History } from 'lucide-react'
import type { ResumeRecommendationResponse } from '@/features/ai/types'

export interface CandidateResumeRecommendationsProps {
  readonly candidateId: string
}

export function CandidateResumeRecommendations({
  candidateId,
}: CandidateResumeRecommendationsProps) {
  const [mode, setMode] = useState<'GENERAL' | 'JOB_SPECIFIC'>('GENERAL')
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)

  const { data: jobsData, isLoading: isLoadingJobs } = useJobs({ limit: 100 })
  const { data: historyData } = useResumeRecommendationHistory(candidateId)
  const { data: activeDetail } = useResumeRecommendation(selectedHistoryId || undefined)

  const generalMutation = useCreateResumeRecommendations()
  const jobMutation = useCreateJobResumeRecommendations()

  const isPending = generalMutation.isPending || jobMutation.isPending
  const mutationError = generalMutation.error || jobMutation.error

  // Display active data from either recent mutation or loaded history
  const activeRecommendation: ResumeRecommendationResponse | null =
    generalMutation.data || jobMutation.data || activeDetail || null

  const jobs = jobsData?.data || []
  const jobOptions = jobs.map((j) => ({
    value: j.id,
    label: `${j.title} (${j.jobCode || j.id.slice(0, 8)})`,
  }))

  const historyItems = historyData || []

  const handleGenerateGeneral = async () => {
    setSelectedHistoryId(null)
    try {
      await generalMutation.mutateAsync({ candidateId })
    } catch {
      // Handled by mutation error state
    }
  }

  const handleGenerateJobSpecific = async () => {
    if (!selectedJobId) return
    setSelectedHistoryId(null)
    try {
      await jobMutation.mutateAsync({
        candidateId,
        jobId: selectedJobId,
      })
    } catch {
      // Handled by mutation error state
    }
  }

  return (
    <div
      data-testid="candidate-resume-recommendations-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* Controls Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface-hover)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Mode Selector Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button
            variant={mode === 'GENERAL' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMode('GENERAL')}
            disabled={isPending}
          >
            General Resume Review
          </Button>

          <Button
            variant={mode === 'JOB_SPECIFIC' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMode('JOB_SPECIFIC')}
            disabled={isPending}
          >
            Role-Targeted Optimization
          </Button>
        </div>

        {/* Action Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          {mode === 'JOB_SPECIFIC' ? (
            <>
              <div style={{ flex: '1 1 280px', minWidth: '240px' }}>
                <Select
                  label="Target Job Requisition"
                  name="jobSelect"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  options={[
                    { value: '', label: 'Select a target job requisition...' },
                    ...jobOptions,
                  ]}
                  disabled={isLoadingJobs || isPending}
                />
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateJobSpecific}
                disabled={!selectedJobId || isPending}
                iconLeft={<Sparkles size={16} />}
              >
                {isPending ? 'Analyzing...' : 'Analyze Resume for Job'}
              </Button>
            </>
          ) : (
            <div>
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateGeneral}
                disabled={isPending}
                iconLeft={<Sparkles size={16} />}
              >
                {isPending ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </div>
          )}
        </div>

        {/* Previous History Quick Picks */}
        {historyItems.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-2)',
              paddingTop: 'var(--space-2)',
              borderTop: '1px solid var(--color-border-subtle)',
              fontSize: 'var(--text-caption)',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <History size={13} />
              Previous Reviews:
            </span>

            {historyItems.map((h) => (
              <Button
                key={h.id}
                variant={selectedHistoryId === h.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedHistoryId(h.id)}
                style={{ fontSize: 'var(--text-caption)', padding: '2px 8px' }}
              >
                {h.mode === 'JOB_SPECIFIC' ? 'Role Match' : 'General'} (
                {new Date(h.createdAt).toLocaleDateString()})
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isPending && (
        <AiLoadingState
          title="Analyzing Resume and Generating Recommendations..."
          description="Evaluating clarity, structural formatting, impact metrics, and key qualification gaps."
        />
      )}

      {/* Error State */}
      {mutationError && (
        <AiErrorState
          title="Resume Recommendation Generation Failed"
          error={mutationError}
          onRetry={mode === 'GENERAL' ? handleGenerateGeneral : handleGenerateJobSpecific}
        />
      )}

      {/* Display Recommendation List */}
      {activeRecommendation && !isPending && (
        <ResumeRecommendationList data={activeRecommendation} />
      )}

      {/* Empty State before generation */}
      {!activeRecommendation && !isPending && !mutationError && (
        <div
          data-testid="resume-recommendations-empty-state"
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
              color: 'var(--color-primary)',
            }}
          >
            <FileText size={22} />
          </div>

          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: 'var(--text-body-md)', fontWeight: 600 }}>
              No Resume Optimization Generated Yet
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                maxWidth: '440px',
              }}
            >
              Run an AI analysis to get actionable advice on structure, impact metrics, missing keywords, and role-specific alignment.
            </p>
          </div>

          <div style={{ marginTop: 'var(--space-2)' }}>
            <AiDisclaimer />
          </div>
        </div>
      )}
    </div>
  )
}
