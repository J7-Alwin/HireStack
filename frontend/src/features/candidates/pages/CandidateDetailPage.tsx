import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCandidate, useDeleteCandidate } from '../hooks'
import { AtsDetailHeader, AtsConfirmDialog } from '@/components/ats'
import {
  CandidateSummary,
  CandidateNotes,
  CandidateTags,
  CandidateResume,
  CandidateAiSection,
} from '../components'
import { Button, ErrorState, EmptyState } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import { Edit2, Trash2, FilePlus } from 'lucide-react'

export function CandidateDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isCompanyAdmin = user?.role === Role.COMPANY_ADMIN

  const { data: candidate, isLoading, isError, error, refetch } = useCandidate(candidateId)
  const deleteMutation = useDeleteCandidate()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!candidateId) return
    await deleteMutation.mutateAsync(candidateId)
    setShowDeleteConfirm(false)
    navigate('/app/candidates')
  }

  if (isLoading) {
    return (
      <div data-testid="candidate-detail-loading" style={{ padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading candidate profile...</p>
      </div>
    )
  }

  if (isError || !candidate) {
    return (
      <ErrorState
        title="Candidate not found"
        description={error?.message || 'Unable to retrieve candidate details.'}
        onRetry={() => void refetch()}
      />
    )
  }

  if (candidate.deletedAt) {
    return (
      <EmptyState
        title="Candidate Profile Deleted"
        description="This candidate has been soft-deleted and is no longer active."
        action={
          <Button variant="primary" onClick={() => navigate('/app/candidates')}>
            Back to Candidates
          </Button>
        }
      />
    )
  }

  return (
    <div
      data-testid="candidate-detail-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <AtsDetailHeader
        title={`${candidate.firstName} ${candidate.lastName}`}
        subtitle={candidate.candidateCode ? `Code: ${candidate.candidateCode}` : undefined}
        status={candidate.status}
        onBack={() => navigate('/app/candidates')}
        backLabel="All Candidates"
        actions={
          <>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/app/applications/new?candidateId=${candidate.id}`)}
              iconLeft={<FilePlus size={15} />}
            >
              Add Application
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(`/app/candidates/${candidate.id}/edit`)}
              iconLeft={<Edit2 size={15} />}
            >
              Edit Profile
            </Button>

            {isCompanyAdmin && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDeleteConfirm(true)}
                iconLeft={<Trash2 size={15} />}
                style={{ color: 'var(--color-error)' }}
              >
                Delete
              </Button>
            )}
          </>
        }
      />

      <CandidateSummary candidate={candidate} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        <CandidateNotes candidateId={candidate.id} notes={candidate.notes} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <CandidateTags candidateId={candidate.id} tags={candidate.tags} />
          <CandidateResume documents={candidate.documents} />
        </div>
      </div>

      <CandidateAiSection candidateId={candidate.id} />

      <AtsConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Candidate Profile"
        description={`Are you sure you want to soft-delete ${candidate.firstName} ${candidate.lastName}?`}
        confirmLabel="Delete Candidate"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
