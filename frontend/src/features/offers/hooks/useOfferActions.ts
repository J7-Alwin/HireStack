import { useMutation, useQueryClient } from '@tanstack/react-query'
import { offersService } from '../services/offers.service'
import { offerKeys } from './offer-query-keys'
import type { Offer, CreateOfferInput } from '../types/offers.types'

export function useSubmitOffer(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Offer, Error, void>({
    mutationFn: () => offersService.submitForApproval(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(offerKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
    },
  })
}

export function useApproveOffer(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Offer, Error, void>({
    mutationFn: () => offersService.approveOffer(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(offerKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })
}

export function useSendOffer(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Offer, Error, void>({
    mutationFn: () => offersService.sendOffer(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(offerKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })
}

export function useMarkOfferViewed(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Offer, Error, void>({
    mutationFn: () => offersService.markViewed(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(offerKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
    },
  })
}

export function useAcceptOffer(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Offer, Error, void>({
    mutationFn: () => offersService.acceptOffer(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(offerKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })
}

export function useDeclineOffer(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Offer, Error, void>({
    mutationFn: () => offersService.declineOffer(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(offerKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })
}

export function useWithdrawOffer(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Offer, Error, void>({
    mutationFn: () => offersService.withdrawOffer(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(offerKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })
}

export function useCreateOfferRevision(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Offer, Error, CreateOfferInput>({
    mutationFn: (input: CreateOfferInput) => offersService.createRevision(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: offerKeys.detail(id) })
    },
  })
}
