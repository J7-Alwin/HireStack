import { useParams, useNavigate } from 'react-router-dom'
import { AtsDetailHeader } from '@/components/ats'
import { JobForm } from '../components'
import { useJob, useUpdateJob } from '../hooks'
import { ErrorState } from '@/components/ui'
import type { CreateJobInput } from '../types/jobs.types'

export function JobEditPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()

  const { data: job, isLoading, isError, error, refetch } = useJob(jobId)
  const updateMutation = useUpdateJob()

  const handleSubmit = async (data: CreateJobInput) => {
    if (!jobId) return
    await updateMutation.mutateAsync({ id: jobId, data })
    navigate(`/app/jobs/${jobId}`)
  }

  if (isLoading) {
    return (
      <div data-testid="job-edit-loading" style={{ padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading job details...</p>
      </div>
    )
  }

  if (isError || !job) {
    return (
      <ErrorState
        title="Failed to load job"
        description={error?.message || 'Unable to retrieve job for editing.'}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div
      data-testid="job-edit-page"
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
        title={`Edit: ${job.title}`}
        subtitle={`Job Code: ${job.jobCode}`}
        onBack={() => navigate(`/app/jobs/${jobId}`)}
        backLabel="Cancel & Return"
      />

      <JobForm
        initialValues={job}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/app/jobs/${jobId}`)}
        isSubmitting={updateMutation.isPending}
        isEdit={true}
      />
    </div>
  )
}
