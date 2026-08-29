import { useParams, useNavigate } from 'react-router-dom'
import { Skeleton, ErrorState, Button } from '@/components/ui'
import { AtsPageHeader } from '@/components/ats'
import { useInterview, useUpdateInterview } from '../hooks'
import { InterviewForm } from '../components'
import type { UpdateInterviewInput } from '../types/interviews.types'
import { ArrowLeft } from 'lucide-react'

export function InterviewEditPage() {
  const { interviewId } = useParams<{ interviewId: string }>()
  const navigate = useNavigate()

  const { data: interview, isLoading, isError, error, refetch } = useInterview(interviewId)
  const updateMutation = useUpdateInterview(interviewId || '')

  const handleSubmit = async (data: unknown) => {
    await updateMutation.mutateAsync(data as UpdateInterviewInput)
    navigate(`/app/interviews/${interviewId}`)
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Skeleton height="60px" />
        <Skeleton height="350px" />
      </div>
    )
  }

  if (isError || !interview) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/interviews')}
          style={{ alignSelf: 'flex-start' }}
          iconLeft={<ArrowLeft size={14} />}
        >
          Back to Interviews
        </Button>
        <ErrorState
          title="Failed to load interview"
          description={error?.message || 'Interview details could not be loaded for editing.'}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <AtsPageHeader
        title={`Edit Interview — ${interview.interviewCode}`}
        subtitle="Update interview delivery mode, location/meeting URL, and internal notes"
      />

      <div style={{ maxWidth: '840px', width: '100%' }}>
        <InterviewForm
          initialValues={interview}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/app/interviews/${interview.id}`)}
          isSubmitting={updateMutation.isPending}
          isEdit={true}
        />
      </div>
    </div>
  )
}
