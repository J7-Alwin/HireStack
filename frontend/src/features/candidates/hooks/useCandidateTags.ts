import { useMutation, useQueryClient } from '@tanstack/react-query'
import { candidatesService } from '../services/candidates.service'
import { candidateKeys } from './candidate-query-keys'
import type { CandidateTag } from '../types/candidates.types'

export function useAddCandidateTag() {
  const queryClient = useQueryClient()

  return useMutation<
    CandidateTag,
    Error,
    { readonly candidateId: string; readonly name: string }
  >({
    mutationFn: ({ candidateId, name }) =>
      candidatesService.assignTag(candidateId, name),
    onSuccess: (_, { candidateId }) => {
      void queryClient.invalidateQueries({
        queryKey: candidateKeys.detail(candidateId),
      })
    },
  })
}

export function useDeleteCandidateTag() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { readonly candidateId: string; readonly tagId: string }
  >({
    mutationFn: ({ candidateId, tagId }) =>
      candidatesService.removeTag(candidateId, tagId),
    onSuccess: (_, { candidateId }) => {
      void queryClient.invalidateQueries({
        queryKey: candidateKeys.detail(candidateId),
      })
    },
  })
}
