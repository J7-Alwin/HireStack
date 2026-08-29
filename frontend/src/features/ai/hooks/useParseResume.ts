import { useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../services/ai.service'
import type { Candidate } from '@/features/candidates'

export function useParseResume() {
  const queryClient = useQueryClient()

  return useMutation<Candidate, Error, File>({
    mutationFn: (file: File) => aiService.parseResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}
