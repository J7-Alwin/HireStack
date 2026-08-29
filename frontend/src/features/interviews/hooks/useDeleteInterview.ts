import { useMutation, useQueryClient } from '@tanstack/react-query'
import { interviewsService } from '../services/interviews.service'
import { interviewKeys } from './interview-query-keys'

export function useDeleteInterview() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => interviewsService.softDeleteInterview(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: interviewKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
    },
  })
}
