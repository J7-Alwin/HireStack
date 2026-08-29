import { useQuery } from '@tanstack/react-query'
import { jobsService, type JobListResponse } from '../services/jobs.service'
import { jobKeys } from './job-query-keys'
import type { JobFilterParams } from '../types/jobs.types'

export function useJobs(params?: JobFilterParams) {
  return useQuery<JobListResponse>({
    queryKey: jobKeys.list(params),
    queryFn: () => jobsService.listJobs(params),
    staleTime: 30 * 1000,
  })
}
