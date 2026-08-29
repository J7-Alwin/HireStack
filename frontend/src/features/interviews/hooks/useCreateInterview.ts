import { useMutation, useQueryClient } from '@tanstack/react-query'
import { interviewsService } from '../services/interviews.service'
import { interviewKeys } from './interview-query-keys'
import type { CreateInterviewInput, Interview } from '../types/interviews.types'

export function useCreateInterview() {
  const queryClient = useQueryClient()

  return useMutation<Interview, Error, CreateInterviewInput>({
    mutationFn: (data) => interviewsService.scheduleInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
      // Invalidate applications lists and pipeline if present
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })
}
