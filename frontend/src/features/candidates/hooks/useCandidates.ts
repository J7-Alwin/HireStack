import { useQuery } from '@tanstack/react-query'
import { candidatesService, type CandidateListResponse } from '../services/candidates.service'
import { candidateKeys } from './candidate-query-keys'
import type { CandidateFilterParams } from '../types/candidates.types'

export function useCandidates(params?: CandidateFilterParams) {
  return useQuery<CandidateListResponse>({
    queryKey: candidateKeys.list(params),
    queryFn: () => candidatesService.listCandidates(params),
    staleTime: 30 * 1000,
  })
}
