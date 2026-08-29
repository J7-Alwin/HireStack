import { useQuery } from '@tanstack/react-query'
import { aiService } from '../services/ai.service'
import { aiKeys } from './ai-query-keys'
import type { AiHealthCheckResponse } from '../types'

export function useAiHealth() {
  return useQuery<AiHealthCheckResponse, Error>({
    queryKey: aiKeys.health(),
    queryFn: () => aiService.health(),
    staleTime: 60 * 1000,
    retry: 1,
  })
}
