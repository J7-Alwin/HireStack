import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pipelineService } from '../services/pipeline.service'
import { pipelineKeys } from './pipeline-query-keys'
import type { MoveStageInput, Pipeline } from '../types/pipeline.types'

export function useMovePipelineStage(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Pipeline, Error, MoveStageInput>({
    mutationFn: (input: MoveStageInput) => pipelineService.moveStage(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(pipelineKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.history(id) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.timeline(id) })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
