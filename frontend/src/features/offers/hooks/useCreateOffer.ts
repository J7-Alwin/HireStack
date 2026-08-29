import { useMutation, useQueryClient } from '@tanstack/react-query'
import { offersService } from '../services/offers.service'
import { offerKeys } from './offer-query-keys'
import type { CreateOfferInput, Offer } from '../types/offers.types'

export function useCreateOffer() {
  const queryClient = useQueryClient()

  return useMutation<Offer, Error, CreateOfferInput>({
    mutationFn: (input: CreateOfferInput) => offersService.createOffer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}
