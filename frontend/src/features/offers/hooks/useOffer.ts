import { useQuery } from '@tanstack/react-query'
import { offersService } from '../services/offers.service'
import { offerKeys } from './offer-query-keys'
import type { Offer } from '../types/offers.types'

export function useOffer(id?: string) {
  return useQuery<Offer, Error>({
    queryKey: offerKeys.detail(id || ''),
    queryFn: () => offersService.getOfferById(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  })
}
