import { useMutation, useQueryClient } from '@tanstack/react-query'
import { candidatesService } from '../services/candidates.service'
import { candidateKeys } from './candidate-query-keys'
import type { CandidateNote } from '../types/candidates.types'

export function useAddCandidateNote() {
  const queryClient = useQueryClient()

  return useMutation<
    CandidateNote,
    Error,
    { readonly candidateId: string; readonly content: string }
  >({
    mutationFn: ({ candidateId, content }) =>
      candidatesService.addNote(candidateId, content),
    onSuccess: (_, { candidateId }) => {
      void queryClient.invalidateQueries({
        queryKey: candidateKeys.detail(candidateId),
      })
    },
  })
}

export function useDeleteCandidateNote() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { readonly candidateId: string; readonly noteId: string }
  >({
    mutationFn: ({ candidateId, noteId }) =>
      candidatesService.deleteNote(candidateId, noteId),
    onSuccess: (_, { candidateId }) => {
      void queryClient.invalidateQueries({
        queryKey: candidateKeys.detail(candidateId),
      })
    },
  })
}
