import { useMutation, useQueryClient } from '@tanstack/react-query'
import { candidatesService } from '../services/candidates.service'
import { candidateKeys } from './candidate-query-keys'
import type { CreateCandidateInput, Candidate } from '../types/candidates.types'

export function useCreateCandidate() {
  const queryClient = useQueryClient()

  return useMutation<Candidate, Error, CreateCandidateInput>({
    mutationFn: (data) => candidatesService.createCandidate(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: candidateKeys.lists() })
    },
  })
}
