import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsService } from '../services/applications.service'
import { applicationKeys } from './application-query-keys'
import type { UpdateApplicationInput, Application } from '../types/applications.types'

export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation<
    Application,
    Error,
    { readonly id: string; readonly data: UpdateApplicationInput }
  >({
    mutationFn: ({ id, data }) => applicationsService.updateApplication(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
    },
  })
}
