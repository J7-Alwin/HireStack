import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../services/ai.service'
import { aiKeys } from './ai-query-keys'
import type {
  GeneralResumeRecommendationRequest,
  JobSpecificResumeRecommendationRequest,
  ResumeRecommendationResponse,
  ResumeRecommendationHistoryResponse,
} from '../types'

export function useResumeRecommendationHistory(candidateId?: string) {
  return useQuery<ResumeRecommendationHistoryResponse, Error>({
    queryKey: aiKeys.resumeRecommendationHistory(candidateId || ''),
    queryFn: () => aiService.getResumeRecommendationHistory(candidateId!),
    enabled: Boolean(candidateId),
  })
}

export function useResumeRecommendation(id?: string) {
  return useQuery<ResumeRecommendationResponse, Error>({
    queryKey: aiKeys.resumeRecommendationDetail(id || ''),
    queryFn: () => aiService.getResumeRecommendation(id!),
    enabled: Boolean(id),
  })
}

export function useCreateResumeRecommendations() {
  const queryClient = useQueryClient()

  return useMutation<
    ResumeRecommendationResponse,
    Error,
    GeneralResumeRecommendationRequest
  >({
    mutationFn: (input: GeneralResumeRecommendationRequest) =>
      aiService.createResumeRecommendations(input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(aiKeys.resumeRecommendationDetail(data.id), data)
      queryClient.invalidateQueries({
        queryKey: aiKeys.resumeRecommendationHistory(variables.candidateId),
      })
    },
  })
}

export function useCreateJobResumeRecommendations() {
  const queryClient = useQueryClient()

  return useMutation<
    ResumeRecommendationResponse,
    Error,
    JobSpecificResumeRecommendationRequest
  >({
    mutationFn: (input: JobSpecificResumeRecommendationRequest) =>
      aiService.createJobResumeRecommendations(input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(aiKeys.resumeRecommendationDetail(data.id), data)
      queryClient.invalidateQueries({
        queryKey: aiKeys.resumeRecommendationHistory(variables.candidateId),
      })
    },
  })
}
