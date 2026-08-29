import { useQuery } from '@tanstack/react-query'
import { interviewsService } from '../services/interviews.service'
import { interviewKeys } from './interview-query-keys'
import type { InterviewFilterParams, InterviewListResponse } from '../types/interviews.types'

export function useInterviews(params?: InterviewFilterParams) {
  return useQuery<InterviewListResponse>({
    queryKey: interviewKeys.list(params),
    queryFn: () => interviewsService.listInterviews(params),
  })
}
