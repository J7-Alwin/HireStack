import { useNavigate } from 'react-router-dom'
import { AtsDetailHeader } from '@/components/ats'
import { JobForm } from '../components'
import { useCreateJob } from '../hooks'
import type { CreateJobInput } from '../types/jobs.types'

export function JobCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateJob()

  const handleSubmit = async (data: CreateJobInput) => {
    const job = await createMutation.mutateAsync(data)
    navigate(`/app/jobs/${job.id}`)
  }

  return (
    <div
      data-testid="job-create-page"
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
        title="Create Job Requisition"
        subtitle="Open a new hiring requisition and start attracting qualified candidates."
        onBack={() => navigate('/app/jobs')}
        backLabel="Cancel & Return"
      />

      <JobForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/jobs')}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}
