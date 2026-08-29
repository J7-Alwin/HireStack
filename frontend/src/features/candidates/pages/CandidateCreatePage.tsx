import { useNavigate } from 'react-router-dom'
import { AtsDetailHeader } from '@/components/ats'
import { CandidateForm } from '../components'
import { useCreateCandidate } from '../hooks'
import type { CreateCandidateInput } from '../types/candidates.types'

export function CandidateCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateCandidate()

  const handleSubmit = async (data: CreateCandidateInput) => {
    const candidate = await createMutation.mutateAsync(data)
    navigate(`/app/candidates/${candidate.id}`)
  }

  return (
    <div
      data-testid="candidate-create-page"
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
        title="Add New Candidate"
        subtitle="Create a new candidate profile and link them with your hiring pipeline."
        onBack={() => navigate('/app/candidates')}
        backLabel="Cancel & Return"
      />

      <CandidateForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/candidates')}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}
