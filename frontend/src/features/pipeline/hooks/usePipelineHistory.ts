import { useQuery } from '@tanstack/react-query'
import { pipelineService } from '../services/pipeline.service'
import { pipelineKeys } from './pipeline-query-keys'
import type { PipelineHistory } from '../types/pipeline.types'

export function usePipelineHistory(id?: string) {
  return useQuery<PipelineHistory[], Error>({
    queryKey: pipelineKeys.history(id || ''),
    queryFn: () => pipelineService.getHistory(id!),
    enabled: Boolean(id),
  })
}
