import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsService } from '../services/applications.service'
import { applicationKeys } from './application-query-keys'
import type {
  Application,
  ApplicationStage,
  ApplicationStatus,
  RejectApplicationInput,
  WithdrawApplicationInput,
} from '../types/applications.types'

export function useUpdateStage() {
  const queryClient = useQueryClient()

  return useMutation<
    Application,
    Error,
    { readonly id: string; readonly stage: ApplicationStage }
  >({
    mutationFn: ({ id, stage }) => applicationsService.updateStage(id, { stage }),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
    },
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()

  return useMutation<
    Application,
    Error,
    { readonly id: string; readonly status: ApplicationStatus }
  >({
    mutationFn: ({ id, status }) => applicationsService.updateStatus(id, { status }),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
    },
  })
}

export function useRejectApplication() {
  const queryClient = useQueryClient()

  return useMutation<
    Application,
    Error,
    { readonly id: string; readonly data: RejectApplicationInput }
  >({
    mutationFn: ({ id, data }) => applicationsService.rejectApplication(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
    },
  })
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient()

  return useMutation<
    Application,
    Error,
    { readonly id: string; readonly data: WithdrawApplicationInput }
  >({
    mutationFn: ({ id, data }) => applicationsService.withdrawApplication(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
    },
  })
}
