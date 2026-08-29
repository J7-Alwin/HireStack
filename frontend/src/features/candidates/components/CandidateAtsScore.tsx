import { useState } from 'react'
import { Button, Select } from '@/components/ui'
import { useJobs } from '@/features/jobs'
import { useAtsScore } from '@/features/ai/hooks'
import { AtsScoreCard, AiLoadingState, AiErrorState, AiDisclaimer } from '@/features/ai/components'
import { Sparkles, Target } from 'lucide-react'

export interface CandidateAtsScoreProps {
  readonly candidateId: string
}

export function CandidateAtsScore({ candidateId }: CandidateAtsScoreProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const { data: jobsData, isLoading: isLoadingJobs } = useJobs({ limit: 100 })
  const atsMutation = useAtsScore()

  const jobs = jobsData?.data || []
  const jobOptions = jobs.map((j) => ({
    value: j.id,
    label: `${j.title} (${j.jobCode || j.id.slice(0, 8)})`,
  }))

  const handleGenerate = async () => {
    if (!selectedJobId) return
    try {
      await atsMutation.mutateAsync({
        candidateId,
        jobId: selectedJobId,
      })
    } catch {
      // Handled by mutation error state
    }
  }

  return (
    <div
      data-testid="candidate-ats-score-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* Controls: Job Selector and Action Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface-hover)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ flex: '1 1 280px', minWidth: '240px' }}>
          <Select
            label="Target Requisition for ATS Match"
            name="jobSelect"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            options={[
              { value: '', label: 'Select a target job requisition...' },
              ...jobOptions,
            ]}
            disabled={isLoadingJobs || atsMutation.isPending}
          />
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleGenerate}
          disabled={!selectedJobId || atsMutation.isPending}
          iconLeft={<Sparkles size={16} />}
        >
          {atsMutation.isPending ? 'Evaluating...' : 'Calculate ATS Score'}
        </Button>
      </div>

      {/* Loading State */}
      {atsMutation.isPending && (
        <AiLoadingState
          title="Evaluating ATS Compatibility..."
          description="Matching candidate resume, skills, experience, and keywords against the selected job requisition."
        />
      )}

      {/* Error State */}
      {atsMutation.isError && (
        <AiErrorState
          title="ATS Scoring Evaluation Failed"
          error={atsMutation.error}
          onRetry={handleGenerate}
        />
      )}

      {/* Results Display */}
      {atsMutation.data && !atsMutation.isPending && (
        <AtsScoreCard score={atsMutation.data} />
      )}

      {/* Empty State before generation */}
      {!atsMutation.data && !atsMutation.isPending && !atsMutation.isError && (
        <div
          data-testid="ats-score-empty-state"
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
            <Target size={22} />
          </div>

          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: 'var(--text-body-md)', fontWeight: 600 }}>
              No ATS Score Generated Yet
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                maxWidth: '440px',
              }}
            >
              Select a target job requisition above and trigger ATS scoring to evaluate qualifications, missing skills, and role alignment.
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
