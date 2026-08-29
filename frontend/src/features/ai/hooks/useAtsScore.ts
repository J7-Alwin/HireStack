import { useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../services/ai.service'
import { aiKeys } from './ai-query-keys'
import type { ATSScoreRequest, ATSScoreResponse } from '../types'

export function useAtsScore() {
  const queryClient = useQueryClient()

  return useMutation<ATSScoreResponse, Error, ATSScoreRequest>({
    mutationFn: (input: ATSScoreRequest) => aiService.createAtsScore(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: aiKeys.jobMatches(variables.jobId),
      })
      queryClient.invalidateQueries({
        queryKey: aiKeys.jobMatchDetail(variables.jobId, variables.candidateId),
      })
    },
  })
}
