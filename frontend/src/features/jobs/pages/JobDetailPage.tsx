import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJob, useDeleteJob } from '../hooks'
import { AtsDetailHeader, AtsConfirmDialog } from '@/components/ats'
import { JobSummary, JobDescription, JobActions, JobAiMatching } from '../components'
import { Button, ErrorState, EmptyState } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import { Edit2, Trash2, UserPlus, GitBranch } from 'lucide-react'

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isCompanyAdmin = user?.role === Role.COMPANY_ADMIN

  const { data: job, isLoading, isError, error, refetch } = useJob(jobId)
  const deleteMutation = useDeleteJob()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!jobId) return
    await deleteMutation.mutateAsync(jobId)
    setShowDeleteConfirm(false)
    navigate('/app/jobs')
  }

  if (isLoading) {
    return (
      <div data-testid="job-detail-loading" style={{ padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading job details...</p>
      </div>
    )
  }

  if (isError || !job) {
    return (
      <ErrorState
        title="Job not found"
        description={error?.message || 'Unable to retrieve job details.'}
        onRetry={() => void refetch()}
      />
    )
  }

  if (job.deletedAt) {
    return (
      <EmptyState
        title="Job Requisition Deleted"
        description="This job has been soft-deleted and is no longer active."
        action={
          <Button variant="primary" onClick={() => navigate('/app/jobs')}>
            Back to Jobs
          </Button>
        }
      />
    )
  }

  return (
    <div
      data-testid="job-detail-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <AtsDetailHeader
        title={job.title}
        subtitle={`Code: ${job.jobCode} • Department: ${job.department?.name || 'Unassigned'}`}
        status={job.status}
        onBack={() => navigate('/app/jobs')}
        backLabel="All Jobs"
        actions={
          <>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/app/applications/new?jobId=${job.id}`)}
              iconLeft={<UserPlus size={15} />}
            >
              Add Applicant
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(`/app/pipeline?jobId=${job.id}`)}
              iconLeft={<GitBranch size={15} />}
            >
              Pipeline
            </Button>

            <JobActions job={job} />

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(`/app/jobs/${job.id}/edit`)}
              iconLeft={<Edit2 size={15} />}
            >
              Edit Job
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

      <JobSummary job={job} />

      <JobDescription job={job} />

      <JobAiMatching jobId={job.id} />

      <AtsConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Job Requisition"
        description={`Are you sure you want to delete ${job.title}?`}
        confirmLabel="Delete Job"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
