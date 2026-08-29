import { useQuery } from '@tanstack/react-query'
import { pipelineService } from '../services/pipeline.service'
import { pipelineKeys } from './pipeline-query-keys'
import type { Pipeline } from '../types/pipeline.types'

export function usePipeline(id?: string) {
  return useQuery<Pipeline, Error>({
    queryKey: pipelineKeys.detail(id || ''),
    queryFn: () => pipelineService.getPipelineById(id!),
    enabled: Boolean(id),
  })
}
