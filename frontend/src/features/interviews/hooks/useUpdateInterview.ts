import { useMutation, useQueryClient } from '@tanstack/react-query'
import { interviewsService } from '../services/interviews.service'
import { interviewKeys } from './interview-query-keys'
import type { UpdateInterviewInput, Interview } from '../types/interviews.types'

export function useUpdateInterview(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Interview, Error, UpdateInterviewInput>({
    mutationFn: (data) => interviewsService.updateInterview(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(interviewKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
    },
  })
}
