import { useQuery } from '@tanstack/react-query'
import { jobsService } from '../services/jobs.service'
import { jobKeys } from './job-query-keys'
import type { Job } from '../types/jobs.types'

export function useJob(id?: string) {
  return useQuery<Job>({
    queryKey: jobKeys.detail(id || ''),
    queryFn: () => jobsService.getJobById(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  })
}
