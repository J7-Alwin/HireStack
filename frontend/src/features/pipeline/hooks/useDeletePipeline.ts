import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pipelineService } from '../services/pipeline.service'
import { pipelineKeys } from './pipeline-query-keys'

export function useDeletePipeline() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => pipelineService.softDeletePipeline(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: pipelineKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
