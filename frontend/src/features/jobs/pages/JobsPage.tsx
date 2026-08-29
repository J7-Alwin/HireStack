import { useNavigate } from 'react-router-dom'
import { useAtsUrlParams } from '@/hooks/useAtsUrlParams'
import { useJobs, useDeleteJob } from '../hooks'
import { AtsPageHeader } from '@/components/ats'
import { JobFilters, JobTable } from '../components'
import { Button, Pagination, ErrorState } from '@/components/ui'
import type { JobFilterParams, Job } from '../types/jobs.types'
import { PlusCircle } from 'lucide-react'

export function JobsPage() {
  const navigate = useNavigate()

  const { params, setParam, setSearch, setPage, resetParams } =
    useAtsUrlParams<JobFilterParams>({
      defaults: {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    })

  const { data, isLoading, isError, error, refetch } = useJobs(params)
  const deleteMutation = useDeleteJob()

  const jobs = data?.data || []
  const meta = data?.meta

  const handleView = (job: Job) => {
    navigate(`/app/jobs/${job.id}`)
  }

  const handleEdit = (job: Job) => {
    navigate(`/app/jobs/${job.id}/edit`)
  }

  const handleDelete = async (jobId: string) => {
    await deleteMutation.mutateAsync(jobId)
  }

  return (
    <div
      data-testid="jobs-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <AtsPageHeader
        title="Jobs"
        subtitle="Manage job requisitions, track hiring statuses, and align team openings."
        primaryAction={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/jobs/new')}
            iconLeft={<PlusCircle size={16} />}
          >
            Post a Job
          </Button>
        }
      />

      <JobFilters
        params={params}
        onSearchChange={setSearch}
        onStatusChange={(status) => setParam('status', status)}
        onEmploymentTypeChange={(type) => setParam('employmentType', type)}
        onDepartmentChange={(dept) => setParam('department', dept)}
        onReset={resetParams}
      />

      {isError ? (
        <ErrorState
          title="Failed to load jobs"
          description={error?.message || 'Unable to retrieve job requisitions.'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <JobTable
            jobs={jobs}
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
