import { useQuery } from '@tanstack/react-query'
import {
  applicationsService,
  type ApplicationListResponse,
} from '../services/applications.service'
import { applicationKeys } from './application-query-keys'
import type { ApplicationFilterParams } from '../types/applications.types'

export function useApplications(params?: ApplicationFilterParams) {
  return useQuery<ApplicationListResponse>({
    queryKey: applicationKeys.list(params),
    queryFn: () => applicationsService.listApplications(params),
    staleTime: 30 * 1000,
  })
}
