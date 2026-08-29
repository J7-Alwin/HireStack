import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsService } from '../services/applications.service'
import { applicationKeys } from './application-query-keys'
import type { CreateApplicationInput, Application } from '../types/applications.types'

export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation<Application, Error, CreateApplicationInput>({
    mutationFn: (data) => applicationsService.createApplication(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
    },
  })
}
