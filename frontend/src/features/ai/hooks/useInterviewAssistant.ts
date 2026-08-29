import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../services/ai.service'
import { aiKeys } from './ai-query-keys'
import type {
  GeneralInterviewRequest,
  JobSpecificInterviewRequest,
  InterviewAssistantResponse,
  InterviewHistoryResponse,
} from '../types'

export function useInterviewAssistantHistory(candidateId?: string) {
  return useQuery<InterviewHistoryResponse, Error>({
    queryKey: aiKeys.interviewAssistantHistory(candidateId || ''),
    queryFn: () => aiService.getInterviewAssistantHistory(candidateId!),
    enabled: Boolean(candidateId),
  })
}

export function useInterviewAssistant(id?: string) {
  return useQuery<InterviewAssistantResponse, Error>({
    queryKey: aiKeys.interviewAssistantDetail(id || ''),
    queryFn: () => aiService.getInterviewAssistant(id!),
    enabled: Boolean(id),
  })
}

export function useCreateInterviewAssistant() {
  const queryClient = useQueryClient()

  return useMutation<
    InterviewAssistantResponse,
    Error,
    GeneralInterviewRequest
  >({
    mutationFn: (input: GeneralInterviewRequest) =>
      aiService.createInterviewAssistant(input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(aiKeys.interviewAssistantDetail(data.id), data)
      queryClient.invalidateQueries({
        queryKey: aiKeys.interviewAssistantHistory(variables.candidateId),
      })
    },
  })
}

export function useCreateJobInterviewAssistant() {
  const queryClient = useQueryClient()

  return useMutation<
    InterviewAssistantResponse,
    Error,
    JobSpecificInterviewRequest
  >({
    mutationFn: (input: JobSpecificInterviewRequest) =>
      aiService.createJobInterviewAssistant(input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(aiKeys.interviewAssistantDetail(data.id), data)
      queryClient.invalidateQueries({
        queryKey: aiKeys.interviewAssistantHistory(variables.candidateId),
      })
    },
  })
}
