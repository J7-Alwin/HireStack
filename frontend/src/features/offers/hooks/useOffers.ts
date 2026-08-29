import { useQuery } from '@tanstack/react-query'
import { offersService } from '../services/offers.service'
import { offerKeys } from './offer-query-keys'
import type { OfferFilterParams, OfferListResponse } from '../types/offers.types'

export function useOffers(params?: OfferFilterParams) {
  return useQuery<OfferListResponse, Error>({
    queryKey: offerKeys.list(params),
    queryFn: () => offersService.listOffers(params),
    staleTime: 30 * 1000,
  })
}
