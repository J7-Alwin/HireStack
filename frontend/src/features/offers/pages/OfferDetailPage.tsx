import { useParams, useNavigate } from 'react-router-dom'
import { Skeleton, Button, ErrorState } from '@/components/ui'
import { AtsDetailHeader } from '@/components/ats'
import { useOffer } from '../hooks'
import {
  OfferSummary,
  OfferCompensation,
  OfferCandidate,
  OfferJob,
  OfferApplication,
  OfferActions,
} from '../components'
import { ArrowLeft, Edit2 } from 'lucide-react'

export function OfferDetailPage() {
  const { offerId } = useParams<{ offerId: string }>()
  const navigate = useNavigate()

  const { data: offer, isLoading, isError, error, refetch } = useOffer(offerId)

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
          title={!offer ? 'Offer Not Found' : 'Failed to load offer'}
          description={
            error?.message ||
            'The requested offer could not be found or you do not have permission to view it.'
          }
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  const candidateName = offer.application?.candidate
    ? `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`
    : 'Candidate'
  const jobTitle = offer.application?.job?.title || 'Job Requisition'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <AtsDetailHeader
        title={`${offer.offerCode} — ${candidateName}`}
        subtitle={`${jobTitle} • Version ${offer.version}`}
        status={offer.status}
        onBack={() => navigate('/app/offers')}
        backLabel="Offers"
        actions={
          offer.status === 'DRAFT' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/app/offers/${offer.id}/edit`)}
              iconLeft={<Edit2 size={14} />}
            >
              Edit Draft
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
        {/* Left Column: Summary, Compensation, Candidate, Job, Application */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <OfferSummary offer={offer} />
          <OfferCompensation offer={offer} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <OfferCandidate candidate={offer.application?.candidate} />
            <OfferJob job={offer.application?.job} />
          </div>

          <OfferApplication application={offer.application} />
        </div>

        {/* Right Column: Actions */}
        <div style={{ position: 'sticky', top: 'var(--space-6)' }}>
          <OfferActions
            offer={offer}
            onEdit={() => navigate(`/app/offers/${offer.id}/edit`)}
            onRevise={() => navigate(`/app/offers/${offer.id}/edit?revision=true`)}
          />
        </div>
      </div>
    </div>
  )
}
