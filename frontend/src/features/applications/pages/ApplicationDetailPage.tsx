import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApplication, useDeleteApplication } from '../hooks'
import { AtsDetailHeader, AtsConfirmDialog, AtsStatusBadge } from '@/components/ats'
import {
  ApplicationSummary,
  ApplicationCandidate,
  ApplicationJob,
  ApplicationActions,
  ApplicationAiInsights,
} from '../components'
import { Button, ErrorState, EmptyState } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import { Edit2, Trash2, Calendar, FileCheck, GitBranch } from 'lucide-react'

export function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isCompanyAdmin = user?.role === Role.COMPANY_ADMIN

  const { data: application, isLoading, isError, error, refetch } = useApplication(applicationId)
  const deleteMutation = useDeleteApplication()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!applicationId) return
    await deleteMutation.mutateAsync(applicationId)
    setShowDeleteConfirm(false)
    navigate('/app/applications')
  }

  if (isLoading) {
    return (
      <div data-testid="application-detail-loading" style={{ padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading application details...</p>
      </div>
    )
  }

  if (isError || !application) {
    return (
      <ErrorState
        title="Application not found"
        description={error?.message || 'Unable to retrieve application details.'}
        onRetry={() => void refetch()}
      />
    )
  }

  if (application.deletedAt) {
    return (
      <EmptyState
        title="Application Deleted"
        description="This application has been soft-deleted."
        action={
          <Button variant="primary" onClick={() => navigate('/app/applications')}>
            Back to Applications
          </Button>
        }
      />
    )
  }

  return (
    <div
      data-testid="application-detail-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <AtsDetailHeader
        title={`Application: ${application.applicationCode}`}
        subtitle={`Candidate: ${application.candidate ? `${application.candidate.firstName} ${application.candidate.lastName}` : '—'} • Job: ${application.job?.title || '—'}`}
        status={application.status}
        onBack={() => navigate('/app/applications')}
        backLabel="All Applications"
        actions={
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
              <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>Stage:</span>
              <AtsStatusBadge status={application.stage} size="md" />
            </div>

            <ApplicationActions application={application} />

            {application.status === 'ACTIVE' && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate(`/app/interviews/new?applicationId=${application.id}`)}
                  iconLeft={<Calendar size={15} />}
                >
                  Schedule Interview
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate(`/app/offers/new?applicationId=${application.id}`)}
                  iconLeft={<FileCheck size={15} />}
                >
                  Create Offer
                </Button>

                {application.job?.id && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => navigate(`/app/pipeline?jobId=${application.job?.id}`)}
                    iconLeft={<GitBranch size={15} />}
                  >
                    Pipeline
                  </Button>
                )}
              </>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(`/app/applications/${application.id}/edit`)}
              iconLeft={<Edit2 size={15} />}
            >
              Edit Notes
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

      {/* Relational Cards: Candidate & Job */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        <ApplicationCandidate candidate={application.candidate} />
        <ApplicationJob job={application.job} />
      </div>

      <ApplicationSummary application={application} />

      {application.candidate?.id && application.job?.id && (
        <ApplicationAiInsights
          candidateId={application.candidate.id}
          jobId={application.job.id}
          candidateName={`${application.candidate.firstName} ${application.candidate.lastName}`}
          jobTitle={application.job.title}
        />
      )}

      <AtsConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Application"
        description={`Are you sure you want to delete application ${application.applicationCode}?`}
        confirmLabel="Delete Application"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
