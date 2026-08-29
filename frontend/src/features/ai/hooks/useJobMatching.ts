import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../services/ai.service'
import { aiKeys } from './ai-query-keys'
import type {
  JobMatchingRequest,
  JobMatchingResponse,
  JobMatchHistoryResponse,
  JobMatchDetailsResponse,
} from '../types'

export function useJobMatches(jobId?: string) {
  return useQuery<JobMatchHistoryResponse, Error>({
    queryKey: aiKeys.jobMatches(jobId || ''),
    queryFn: () => aiService.getJobMatches(jobId!),
    enabled: Boolean(jobId),
  })
}

export function useCandidateJobMatch(jobId?: string, candidateId?: string) {
  return useQuery<JobMatchDetailsResponse, Error>({
    queryKey: aiKeys.jobMatchDetail(jobId || '', candidateId || ''),
    queryFn: () => aiService.getCandidateJobMatch(jobId!, candidateId!),
    enabled: Boolean(jobId && candidateId),
  })
}

export function useGenerateJobMatching() {
  const queryClient = useQueryClient()

  return useMutation<JobMatchingResponse, Error, JobMatchingRequest>({
    mutationFn: (input: JobMatchingRequest) => aiService.createJobMatching(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: aiKeys.jobMatches(variables.jobId),
      })
    },
  })
}
