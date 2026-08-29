import { useState } from 'react'
import { Button, Select } from '@/components/ui'
import { useJobs } from '@/features/jobs'
import {
  useCreateAiInsights,
  useAiInsightHistory,
  useAiInsight,
} from '@/features/ai/hooks'
import {
  AiInsightSummaryCard,
  AiLoadingState,
  AiErrorState,
  AiDisclaimer,
} from '@/features/ai/components'
import { Sparkles, Brain, History } from 'lucide-react'
import type { AiInsightResponse } from '@/features/ai/types'

export interface CandidateAiInsightsProps {
  readonly candidateId: string
}

export function CandidateAiInsights({ candidateId }: CandidateAiInsightsProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)

  const { data: jobsData, isLoading: isLoadingJobs } = useJobs({ limit: 100 })
  const { data: historyData } = useAiInsightHistory(candidateId)
  const { data: activeDetail } = useAiInsight(selectedHistoryId || undefined)

  const insightsMutation = useCreateAiInsights()

  const isPending = insightsMutation.isPending
  const mutationError = insightsMutation.error

  const activeInsight: AiInsightResponse | null =
    insightsMutation.data || activeDetail || null

  const jobs = jobsData?.data || []
  const jobOptions = jobs.map((j) => ({
    value: j.id,
    label: `${j.title} (${j.jobCode || j.id.slice(0, 8)})`,
  }))

  const historyItems = historyData || []

  const handleGenerate = async () => {
    if (!selectedJobId) return
    setSelectedHistoryId(null)
    try {
      await insightsMutation.mutateAsync({
        candidateId,
        jobId: selectedJobId,
      })
    } catch {
      // Handled by mutation error state
    }
  }

  return (
    <div
      data-testid="candidate-ai-insights-section"
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
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ flex: '1 1 280px', minWidth: '240px' }}>
            <Select
              label="Target Requisition for Evaluation"
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
            onClick={handleGenerate}
            disabled={!selectedJobId || isPending}
            iconLeft={<Sparkles size={16} />}
          >
            {isPending ? 'Synthesizing...' : 'Generate Recruiter Insights'}
          </Button>
        </div>

        {/* Previous Insights History Quick Picks */}
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
              Previous Insight Evaluations:
            </span>

            {historyItems.map((h) => (
              <Button
                key={h.id}
                variant={selectedHistoryId === h.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedHistoryId(h.id)}
                style={{ fontSize: 'var(--text-caption)', padding: '2px 8px' }}
              >
                Confidence: {h.hiringConfidence}% ({new Date(h.createdAt).toLocaleDateString()})
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isPending && (
        <AiLoadingState
          title="Synthesizing Recruiter AI Insights..."
          description="Evaluating holistic profile fit, trajectory, hiring risks, confidence, and recruiter focus probes."
        />
      )}

      {/* Error State */}
      {mutationError && (
        <AiErrorState
          title="AI Insight Synthesis Failed"
          error={mutationError}
          onRetry={handleGenerate}
        />
      )}

      {/* Display Active Insight */}
      {activeInsight && !isPending && (
        <AiInsightSummaryCard data={activeInsight} />
      )}

      {/* Empty State before generation */}
      {!activeInsight && !isPending && !mutationError && (
        <div
          data-testid="ai-insights-empty-state"
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
            <Brain size={22} />
          </div>

          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: 'var(--text-body-md)', fontWeight: 600 }}>
              No Recruiter Insights Generated Yet
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                maxWidth: '440px',
              }}
            >
              Select a target role requisition and trigger AI synthesis to generate an executive candidate summary, hiring risks, and structured recruiter focus probes.
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
