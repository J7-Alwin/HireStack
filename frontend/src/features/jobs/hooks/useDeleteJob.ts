import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsService } from '../services/jobs.service'
import { jobKeys } from './job-query-keys'
import type { Job } from '../types/jobs.types'

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation<Job, Error, string>({
    mutationFn: (id) => jobsService.softDeleteJob(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}
