import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pipelineService } from '../services/pipeline.service'
import { pipelineKeys } from './pipeline-query-keys'
import type { AddNotesInput, Pipeline } from '../types/pipeline.types'

export function useAddPipelineNotes(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Pipeline, Error, AddNotesInput>({
    mutationFn: (input: AddNotesInput) => pipelineService.addNotes(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(pipelineKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.timeline(id) })
    },
  })
}
