import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsService } from '../services/jobs.service'
import { jobKeys } from './job-query-keys'
import type { CreateJobInput, Job } from '../types/jobs.types'

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation<Job, Error, CreateJobInput>({
    mutationFn: (data) => jobsService.createJob(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}
