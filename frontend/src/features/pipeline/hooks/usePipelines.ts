import { useQuery } from '@tanstack/react-query'
import { pipelineService } from '../services/pipeline.service'
import { pipelineKeys } from './pipeline-query-keys'
import type { PipelineQueryFilters, PipelineListResponse } from '../types/pipeline.types'

export function usePipelines(filters?: PipelineQueryFilters) {
  return useQuery<PipelineListResponse, Error>({
    queryKey: pipelineKeys.list(filters),
    queryFn: () => pipelineService.listPipelines(filters),
  })
}
