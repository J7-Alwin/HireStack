import { useMutation, useQueryClient } from '@tanstack/react-query'
import { offersService } from '../services/offers.service'
import { offerKeys } from './offer-query-keys'

export function useDeleteOffer() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => offersService.softDeleteOffer(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: offerKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
    },
  })
}
