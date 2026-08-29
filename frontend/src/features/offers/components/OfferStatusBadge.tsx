import { AtsStatusBadge } from '@/components/ats'
import { getOfferStatusLabel, getOfferStatusVariant } from '../utils/offer-helpers'
import type { OfferStatus } from '../types/offers.types'

export interface OfferStatusBadgeProps {
  readonly status: OfferStatus
  readonly size?: 'sm' | 'md'
}

export function OfferStatusBadge({ status, size = 'sm' }: OfferStatusBadgeProps) {
  return (
    <AtsStatusBadge
      status={status}
      label={getOfferStatusLabel(status)}
      variant={getOfferStatusVariant(status)}
      size={size}
    />
  )
}
