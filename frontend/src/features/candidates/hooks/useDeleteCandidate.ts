import { useMutation, useQueryClient } from '@tanstack/react-query'
import { candidatesService } from '../services/candidates.service'
import { candidateKeys } from './candidate-query-keys'
import type { Candidate } from '../types/candidates.types'

export function useDeleteCandidate() {
  const queryClient = useQueryClient()

  return useMutation<Candidate, Error, string>({
    mutationFn: (id) => candidatesService.softDeleteCandidate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: candidateKeys.lists() })
    },
  })
}
