import { useMutation, useQueryClient } from '@tanstack/react-query'
import { offersService } from '../services/offers.service'
import { offerKeys } from './offer-query-keys'
import type { UpdateOfferInput, Offer } from '../types/offers.types'

export function useUpdateOffer(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Offer, Error, UpdateOfferInput>({
    mutationFn: (input: UpdateOfferInput) => offersService.updateDraft(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(offerKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
    },
  })
}
