import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsService } from '../services/applications.service'
import { applicationKeys } from './application-query-keys'
import type { Application } from '../types/applications.types'

export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation<Application, Error, string>({
    mutationFn: (id) => applicationsService.softDeleteApplication(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
    },
  })
}
