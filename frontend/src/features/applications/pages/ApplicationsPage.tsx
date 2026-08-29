import { useNavigate } from 'react-router-dom'
import { useAtsUrlParams } from '@/hooks/useAtsUrlParams'
import { useApplications, useDeleteApplication } from '../hooks'
import { AtsPageHeader } from '@/components/ats'
import { ApplicationFilters, ApplicationTable } from '../components'
import { Button, Pagination, ErrorState } from '@/components/ui'
import type { ApplicationFilterParams, Application } from '../types/applications.types'
import { PlusCircle } from 'lucide-react'

export function ApplicationsPage() {
  const navigate = useNavigate()

  const { params, setParam, setSearch, setPage, resetParams } =
    useAtsUrlParams<ApplicationFilterParams>({
      defaults: {
        page: 1,
        limit: 10,
        sortBy: 'appliedAt',
        sortOrder: 'desc',
      },
    })

  const { data, isLoading, isError, error, refetch } = useApplications(params)
  const deleteMutation = useDeleteApplication()

  const applications = data?.data || []
  const meta = data?.meta

  const handleView = (app: Application) => {
    navigate(`/app/applications/${app.id}`)
  }

  const handleEdit = (app: Application) => {
    navigate(`/app/applications/${app.id}/edit`)
  }

  const handleDelete = async (appId: string) => {
    await deleteMutation.mutateAsync(appId)
  }

  return (
    <div
      data-testid="applications-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <AtsPageHeader
        title="Applications"
        subtitle="Track candidate submissions across job requisitions and drive pipeline progression."
        primaryAction={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/applications/new')}
            iconLeft={<PlusCircle size={16} />}
          >
            New Application
          </Button>
        }
      />

      <ApplicationFilters
        params={params}
        onSearchChange={setSearch}
        onStageChange={(stage) => setParam('stage', stage)}
        onStatusChange={(status) => setParam('status', status)}
        onSourceChange={(source) => setParam('source', source)}
        onReset={resetParams}
      />

      {isError ? (
        <ErrorState
          title="Failed to load applications"
          description={error?.message || 'Unable to retrieve applications.'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <ApplicationTable
            applications={applications}
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
    </div>
  )
}
