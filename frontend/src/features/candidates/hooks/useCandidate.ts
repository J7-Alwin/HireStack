import { useQuery } from '@tanstack/react-query'
import { candidatesService } from '../services/candidates.service'
import { candidateKeys } from './candidate-query-keys'
import type { Candidate } from '../types/candidates.types'

export function useCandidate(id?: string) {
  return useQuery<Candidate>({
    queryKey: candidateKeys.detail(id || ''),
    queryFn: () => candidatesService.getCandidateById(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  })
}
