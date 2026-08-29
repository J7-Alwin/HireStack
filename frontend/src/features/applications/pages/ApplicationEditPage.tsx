import { useParams, useNavigate } from 'react-router-dom'
import { AtsDetailHeader } from '@/components/ats'
import { ApplicationForm } from '../components'
import { useApplication, useUpdateApplication } from '../hooks'
import { ErrorState } from '@/components/ui'
import type { CreateApplicationInput } from '../types/applications.types'

export function ApplicationEditPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()

  const { data: application, isLoading, isError, error, refetch } = useApplication(applicationId)
  const updateMutation = useUpdateApplication()

  const handleSubmit = async (data: CreateApplicationInput) => {
    if (!applicationId) return
    await updateMutation.mutateAsync({
      id: applicationId,
      data: { remarks: data.remarks },
    })
    navigate(`/app/applications/${applicationId}`)
  }

  if (isLoading) {
    return (
      <div data-testid="application-edit-loading" style={{ padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading application details...</p>
      </div>
    )
  }

  if (isError || !application) {
    return (
      <ErrorState
        title="Failed to load application"
        description={error?.message || 'Unable to retrieve application for editing.'}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div
      data-testid="application-edit-page"
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
        title={`Edit Application: ${application.applicationCode}`}
        subtitle={`Candidate: ${application.candidate?.firstName || ''} ${application.candidate?.lastName || ''} • Job: ${application.job?.title || ''}`}
        onBack={() => navigate(`/app/applications/${applicationId}`)}
        backLabel="Cancel & Return"
      />

      <ApplicationForm
        initialValues={application}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/app/applications/${applicationId}`)}
        isSubmitting={updateMutation.isPending}
        isEdit={true}
      />
    </div>
  )
}
