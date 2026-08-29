import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsService } from '../services/jobs.service'
import { jobKeys } from './job-query-keys'
import type { UpdateJobInput, Job } from '../types/jobs.types'

export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation<
    Job,
    Error,
    { readonly id: string; readonly data: UpdateJobInput }
  >({
    mutationFn: ({ id, data }) => jobsService.updateJob(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}
