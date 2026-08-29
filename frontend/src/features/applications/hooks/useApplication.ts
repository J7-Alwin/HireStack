import { useQuery } from '@tanstack/react-query'
import { applicationsService } from '../services/applications.service'
import { applicationKeys } from './application-query-keys'
import type { Application } from '../types/applications.types'

export function useApplication(id?: string) {
  return useQuery<Application>({
    queryKey: applicationKeys.detail(id || ''),
    queryFn: () => applicationsService.getApplicationById(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  })
}
