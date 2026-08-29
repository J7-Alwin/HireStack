import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { Pagination, Button, ErrorState } from '@/components/ui'
import { AtsPageHeader } from '@/components/ats'
import { useAtsUrlParams } from '@/hooks/useAtsUrlParams'
import { useInterviews, useDeleteInterview } from '../hooks'
import { InterviewTable, InterviewFilters } from '../components'
import type {
  Interview,
  InterviewFilterParams,
} from '../types/interviews.types'

export function InterviewsPage() {
  const navigate = useNavigate()
  const { params, setParam, setSearch, setPage, resetParams } =
    useAtsUrlParams<InterviewFilterParams>({
      defaults: {
        page: 1,
        limit: 10,
        sortBy: 'scheduledDate',
        sortOrder: 'asc',
      },
    })

  const { data, isLoading, isError, error, refetch } = useInterviews(params)
  const deleteMutation = useDeleteInterview()

  const interviews = data?.data || []
  const pagination = data?.meta

  const handleView = (item: Interview) => {
    navigate(`/app/interviews/${item.id}`)
  }

  const handleEdit = (item: Interview) => {
    navigate(`/app/interviews/${item.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  return (
    <div
      data-testid="interviews-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <AtsPageHeader
        title="Interviews"
        subtitle="Schedule, coordinate, and track candidate interview evaluations across recruitment stages."
        primaryAction={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/interviews/new')}
            iconLeft={<PlusCircle size={16} />}
            aria-label="Schedule interview"
          >
            Schedule Interview
          </Button>
        }
      />

      <InterviewFilters
        params={params}
        onSearchChange={setSearch}
        onStatusChange={(status) => setParam('status', status)}
        onRoundChange={(round) => setParam('round', round)}
        onTypeChange={(type) => setParam('interviewType', type)}
        onModeChange={(mode) => setParam('mode', mode)}
        onOutcomeChange={(outcome) => setParam('outcome', outcome)}
        onReset={resetParams}
      />

      {isError ? (
        <ErrorState
          title="Failed to load interviews"
          description={error?.message || 'An unexpected error occurred while loading interviews.'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <InterviewTable
            interviews={interviews}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
