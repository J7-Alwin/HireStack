import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtsUrlParams } from '@/hooks/useAtsUrlParams'
import { useCandidates, useDeleteCandidate } from '../hooks'
import { AtsPageHeader } from '@/components/ats'
import { CandidateFilters, CandidateTable } from '../components'
import { Button, Pagination, ErrorState } from '@/components/ui'
import { ResumeUploadParserModal } from '@/features/ai/components'
import type { CandidateFilterParams, Candidate } from '../types/candidates.types'
import { UserPlus, UploadCloud } from 'lucide-react'

export function CandidatesPage() {
  const navigate = useNavigate()
  const [showResumeModal, setShowResumeModal] = useState(false)

  const { params, setParam, setSearch, setPage, resetParams } =
    useAtsUrlParams<CandidateFilterParams>({
      defaults: {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    })

  const { data, isLoading, isError, error, refetch } = useCandidates(params)
  const deleteMutation = useDeleteCandidate()

  const candidates = data?.data || []
  const meta = data?.meta

  const handleView = (candidate: Candidate) => {
    navigate(`/app/candidates/${candidate.id}`)
  }

  const handleEdit = (candidate: Candidate) => {
    navigate(`/app/candidates/${candidate.id}/edit`)
  }

  const handleDelete = async (candidateId: string) => {
    await deleteMutation.mutateAsync(candidateId)
  }

  return (
    <div
      data-testid="candidates-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <AtsPageHeader
        title="Candidates"
        subtitle="Discover, evaluate, and track candidate profiles across your talent pipeline."
        primaryAction={
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowResumeModal(true)}
              iconLeft={<UploadCloud size={16} />}
            >
              Import / Parse Resume
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/app/candidates/new')}
              iconLeft={<UserPlus size={16} />}
            >
              Add Candidate
            </Button>
          </div>
        }
      />

      <CandidateFilters
        params={params}
        onSearchChange={setSearch}
        onStatusChange={(status) => setParam('status', status)}
        onSourceChange={(source) => setParam('source', source)}
        onReset={resetParams}
      />

      {isError ? (
        <ErrorState
          title="Failed to load candidates"
          description={error?.message || 'Unable to retrieve candidates list.'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <CandidateTable
            candidates={candidates}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {meta && meta.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      <ResumeUploadParserModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onSuccess={(created) => {
          setShowResumeModal(false)
          navigate(`/app/candidates/${created.id}`)
        }}
      />
    </div>
  )
}
