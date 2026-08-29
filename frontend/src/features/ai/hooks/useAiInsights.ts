import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../services/ai.service'
import { aiKeys } from './ai-query-keys'
import type {
  GenerateAiInsightsRequest,
  AiInsightResponse,
  AiInsightHistoryResponse,
} from '../types'

export function useAiInsightHistory(candidateId?: string) {
  return useQuery<AiInsightHistoryResponse, Error>({
    queryKey: aiKeys.insightHistory(candidateId || ''),
    queryFn: () => aiService.getAiInsightHistory(candidateId!),
    enabled: Boolean(candidateId),
  })
}

export function useAiInsight(id?: string) {
  return useQuery<AiInsightResponse, Error>({
    queryKey: aiKeys.insightDetail(id || ''),
    queryFn: () => aiService.getAiInsight(id!),
    enabled: Boolean(id),
  })
}

export function useCreateAiInsights() {
  const queryClient = useQueryClient()

  return useMutation<AiInsightResponse, Error, GenerateAiInsightsRequest>({
    mutationFn: (input: GenerateAiInsightsRequest) =>
      aiService.createAiInsights(input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(aiKeys.insightDetail(data.id), data)
      queryClient.invalidateQueries({
        queryKey: aiKeys.insightHistory(variables.candidateId),
      })
    },
  })
}
