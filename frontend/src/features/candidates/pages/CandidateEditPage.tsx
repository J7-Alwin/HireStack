import { useParams, useNavigate } from 'react-router-dom'
import { AtsDetailHeader } from '@/components/ats'
import { CandidateForm } from '../components'
import { useCandidate, useUpdateCandidate } from '../hooks'
import { ErrorState } from '@/components/ui'
import type { CreateCandidateInput } from '../types/candidates.types'

export function CandidateEditPage() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const navigate = useNavigate()

  const { data: candidate, isLoading, isError, error, refetch } = useCandidate(candidateId)
  const updateMutation = useUpdateCandidate()

  const handleSubmit = async (data: CreateCandidateInput) => {
    if (!candidateId) return
    await updateMutation.mutateAsync({ id: candidateId, data })
    navigate(`/app/candidates/${candidateId}`)
  }

  if (isLoading) {
    return (
      <div data-testid="candidate-edit-loading" style={{ padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading candidate data...</p>
      </div>
    )
  }

  if (isError || !candidate) {
    return (
      <ErrorState
        title="Failed to load candidate"
        description={error?.message || 'Unable to retrieve candidate for editing.'}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div
      data-testid="candidate-edit-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <AtsDetailHeader
        title={`Edit: ${candidate.firstName} ${candidate.lastName}`}
        subtitle={`Candidate Code: ${candidate.candidateCode}`}
        onBack={() => navigate(`/app/candidates/${candidateId}`)}
        backLabel="Cancel & Return"
      />

      <CandidateForm
        initialValues={candidate}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/app/candidates/${candidateId}`)}
        isSubmitting={updateMutation.isPending}
        isEdit={true}
      />
    </div>
  )
}
