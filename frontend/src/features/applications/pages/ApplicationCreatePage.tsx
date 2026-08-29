import { useNavigate, useSearchParams } from 'react-router-dom'
import { AtsDetailHeader } from '@/components/ats'
import { ApplicationForm } from '../components'
import { useCreateApplication } from '../hooks'
import type { CreateApplicationInput } from '../types/applications.types'

export function ApplicationCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCandidateId = searchParams.get('candidateId') || ''
  const initialJobId = searchParams.get('jobId') || ''

  const createMutation = useCreateApplication()

  const handleSubmit = async (data: CreateApplicationInput) => {
    const app = await createMutation.mutateAsync(data)
    navigate(`/app/applications/${app.id}`)
  }

  return (
    <div
      data-testid="application-create-page"
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
        title="Submit New Application"
        subtitle="Match an active candidate to an open job requisition and begin candidate screening."
        onBack={() => navigate('/app/applications')}
        backLabel="Cancel & Return"
      />

      <ApplicationForm
        initialValues={{ candidateId: initialCandidateId, jobId: initialJobId }}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/applications')}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}
