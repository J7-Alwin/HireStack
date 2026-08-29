import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Skeleton, ErrorState, Button } from '@/components/ui'
import { AtsPageHeader } from '@/components/ats'
import { useOffer, useUpdateOffer, useCreateOfferRevision } from '../hooks'
import { OfferForm } from '../components'
import type { CreateOfferInput, UpdateOfferInput } from '../types/offers.types'
import { ArrowLeft } from 'lucide-react'

export function OfferEditPage() {
  const { offerId } = useParams<{ offerId: string }>()
  const [searchParams] = useSearchParams()
  const isRevision = searchParams.get('revision') === 'true'
  const navigate = useNavigate()

  const { data: offer, isLoading, isError, error, refetch } = useOffer(offerId)
  const updateMutation = useUpdateOffer(offerId || '')
  const revisionMutation = useCreateOfferRevision(offerId || '')

  const handleSubmit = async (data: unknown) => {
    if (isRevision) {
      const res = await revisionMutation.mutateAsync(data as CreateOfferInput)
      navigate(`/app/offers/${res.id}`)
    } else {
      await updateMutation.mutateAsync(data as UpdateOfferInput)
      navigate(`/app/offers/${offerId}`)
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Skeleton height="60px" />
        <Skeleton height="350px" />
      </div>
    )
  }

  if (isError || !offer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/offers')}
          style={{ alignSelf: 'flex-start' }}
          iconLeft={<ArrowLeft size={14} />}
        >
          Back to Offers
        </Button>
        <ErrorState
          title="Failed to load offer"
          description={error?.message || 'Offer details could not be loaded for editing.'}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <AtsPageHeader
        title={
          isRevision
            ? `Create Revision — ${offer.offerCode} (v${offer.version + 1})`
            : `Edit Draft Offer — ${offer.offerCode}`
        }
        subtitle={
          isRevision
            ? 'Produce an updated offer revision under the same offer code'
            : 'Update compensation, proposed dates, and benefits terms for this draft offer'
        }
      />

      <div style={{ maxWidth: '840px', width: '100%' }}>
        <OfferForm
          initialValues={offer}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/app/offers/${offer.id}`)}
          isSubmitting={updateMutation.isPending || revisionMutation.isPending}
          isEdit={!isRevision}
          isRevision={isRevision}
        />
      </div>
    </div>
  )
}
