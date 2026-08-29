import { useNavigate, useSearchParams } from 'react-router-dom'
import { AtsPageHeader } from '@/components/ats'
import { useCreateOffer } from '../hooks'
import { OfferForm } from '../components'
import type { CreateOfferInput } from '../types/offers.types'

export function OfferCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialApplicationId = searchParams.get('applicationId') || ''

  const createMutation = useCreateOffer()

  const handleSubmit = async (data: unknown) => {
    const res = await createMutation.mutateAsync(data as CreateOfferInput)
    navigate(`/app/offers/${res.id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <AtsPageHeader
        title="Create Offer"
        subtitle="Prepare and generate a candidate job offer draft for an active application"
      />

      <div style={{ maxWidth: '840px', width: '100%' }}>
        <OfferForm
          initialValues={{ applicationId: initialApplicationId }}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/app/offers')}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  )
}
