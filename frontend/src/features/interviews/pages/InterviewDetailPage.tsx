import { useParams, useNavigate } from 'react-router-dom'
import { Skeleton, Button, ErrorState } from '@/components/ui'
import { AtsDetailHeader } from '@/components/ats'
import { useInterview } from '../hooks'
import {
  InterviewSummary,
  InterviewSchedule,
  InterviewCandidate,
  InterviewApplication,
  InterviewJob,
  InterviewActions,
  InterviewAiAssistant,
} from '../components'
import { getRoundLabel } from '../utils/interview-helpers'
import { ArrowLeft, Edit2 } from 'lucide-react'

export function InterviewDetailPage() {
  const { interviewId } = useParams<{ interviewId: string }>()
  const navigate = useNavigate()

  const { data: interview, isLoading, isError, error, refetch } = useInterview(interviewId)

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Skeleton height="60px" />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Skeleton height="200px" />
            <Skeleton height="150px" />
            <Skeleton height="150px" />
          </div>
          <div>
            <Skeleton height="250px" />
          </div>
        </div>
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
          title={!interview ? 'Interview Not Found' : 'Failed to load interview'}
          description={
            error?.message ||
            'The requested interview could not be found or you do not have permission to view it.'
          }
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  const candidateName = interview.application?.candidate
    ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`
    : 'Candidate'
  const jobTitle = interview.application?.job?.title || 'Job Requisition'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <AtsDetailHeader
        title={`${getRoundLabel(interview.round)} — ${interview.interviewCode}`}
        subtitle={`${candidateName} • ${jobTitle}`}
        status={interview.status}
        onBack={() => navigate('/app/interviews')}
        backLabel="Interviews"
        actions={
          interview.status !== 'COMPLETED' &&
          interview.status !== 'CANCELLED' &&
          interview.status !== 'NO_SHOW' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/app/interviews/${interview.id}/edit`)}
              iconLeft={<Edit2 size={14} />}
            >
              Edit Details
            </Button>
          ) : undefined
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
          gap: 'var(--space-6)',
          alignItems: 'flex-start',
        }}
      >
        {/* Left Column: Context, Schedule & Relations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <InterviewSummary interview={interview} />
          <InterviewSchedule interview={interview} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <InterviewCandidate candidate={interview.application?.candidate} />
            <InterviewJob job={interview.application?.job} />
          </div>

          <InterviewApplication application={interview.application} />

          <InterviewAiAssistant
            candidateId={interview.application?.candidate?.id}
            jobId={interview.application?.job?.id}
            candidateName={candidateName}
            jobTitle={jobTitle}
            applicationId={interview.applicationId}
          />
        </div>

        {/* Right Column: Actions */}
        <div style={{ position: 'sticky', top: 'var(--space-6)' }}>
          <InterviewActions
            interview={interview}
            onEdit={() => navigate(`/app/interviews/${interview.id}/edit`)}
          />
        </div>
      </div>
    </div>
  )
}
