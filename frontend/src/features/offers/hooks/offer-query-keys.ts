import type { OfferFilterParams } from '../types/offers.types'

export const offerKeys = {
  all: ['offers'] as const,
  lists: () => [...offerKeys.all, 'list'] as const,
  list: (filters?: OfferFilterParams) =>
    [...offerKeys.lists(), { ...filters }] as const,
  details: () => [...offerKeys.all, 'detail'] as const,
  detail: (id: string) => [...offerKeys.details(), id] as const,
}
