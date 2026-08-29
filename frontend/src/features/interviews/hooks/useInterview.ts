import { useQuery } from '@tanstack/react-query'
import { interviewsService } from '../services/interviews.service'
import { interviewKeys } from './interview-query-keys'
import type { Interview } from '../types/interviews.types'

export function useInterview(id?: string) {
  return useQuery<Interview>({
    queryKey: interviewKeys.detail(id || ''),
    queryFn: () => interviewsService.getInterviewById(id!),
    enabled: Boolean(id),
  })
}
