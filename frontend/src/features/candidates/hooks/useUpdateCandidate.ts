import { useMutation, useQueryClient } from '@tanstack/react-query'
import { candidatesService } from '../services/candidates.service'
import { candidateKeys } from './candidate-query-keys'
import type { UpdateCandidateInput, Candidate } from '../types/candidates.types'

export function useUpdateCandidate() {
  const queryClient = useQueryClient()

  return useMutation<
    Candidate,
    Error,
    { readonly id: string; readonly data: UpdateCandidateInput }
  >({
    mutationFn: ({ id, data }) => candidatesService.updateCandidate(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: candidateKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: candidateKeys.lists() })
    },
  })
}
