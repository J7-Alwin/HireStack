import { useQuery } from '@tanstack/react-query'
import { pipelineService } from '../services/pipeline.service'
import { pipelineKeys } from './pipeline-query-keys'
import type { PipelineTimeline } from '../types/pipeline.types'

export function usePipelineTimeline(id?: string) {
  return useQuery<PipelineTimeline[], Error>({
    queryKey: pipelineKeys.timeline(id || ''),
    queryFn: () => pipelineService.getTimeline(id!),
    enabled: Boolean(id),
  })
}
