import { useNavigate, useSearchParams } from 'react-router-dom'
import { AtsPageHeader } from '@/components/ats'
import { useCreateInterview } from '../hooks'
import { InterviewForm } from '../components'
import type { CreateInterviewInput } from '../types/interviews.types'

export function InterviewCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialApplicationId = searchParams.get('applicationId') || ''

  const createMutation = useCreateInterview()

  const handleSubmit = async (data: unknown) => {
    const res = await createMutation.mutateAsync(data as CreateInterviewInput)
    navigate(`/app/interviews/${res.id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <AtsPageHeader
        title="Schedule Interview"
        subtitle="Set up a new candidate interview round for an active application"
      />

      <div style={{ maxWidth: '840px', width: '100%' }}>
        <InterviewForm
          initialValues={{ applicationId: initialApplicationId }}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/app/interviews')}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  )
}
