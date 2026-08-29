import { useQuery } from '@tanstack/react-query'
import { jobsService } from '../services/jobs.service'
import type { JobDepartment } from '../types/jobs.types'

export function useDepartmentOptions() {
  return useQuery<readonly JobDepartment[]>({
    queryKey: ['departments', 'options'],
    queryFn: jobsService.getDepartmentOptions,
    staleTime: 5 * 60 * 1000,
  })
}
