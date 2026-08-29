import { useMutation, useQueryClient } from '@tanstack/react-query'
import { interviewsService } from '../services/interviews.service'
import { interviewKeys } from './interview-query-keys'
import type {
  Interview,
  UpdateInterviewStatusInput,
  RescheduleInterviewInput,
  RecordInterviewOutcomeInput,
  CancelInterviewInput,
  AssignInterviewersInput,
} from '../types/interviews.types'

/**
 * Mutation hook for updating interview status
 */
export function useUpdateInterviewStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Interview, Error, UpdateInterviewStatusInput>({
    mutationFn: (data) => interviewsService.updateStatus(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(interviewKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    },
  })
}

/**
 * Mutation hook for rescheduling an interview
 */
export function useRescheduleInterview(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Interview, Error, RescheduleInterviewInput>({
    mutationFn: (data) => interviewsService.rescheduleInterview(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(interviewKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
    },
  })
}

/**
 * Mutation hook for recording interview outcome & result notes
 */
export function useRecordInterviewOutcome(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Interview, Error, RecordInterviewOutcomeInput>({
    mutationFn: (data) => interviewsService.recordOutcome(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(interviewKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
    },
  })
}

/**
 * Mutation hook for cancelling an interview
 */
export function useCancelInterview(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Interview, Error, CancelInterviewInput>({
    mutationFn: (data) => interviewsService.cancelInterview(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(interviewKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
    },
  })
}

/**
 * Mutation hook for assigning interviewers
 */
export function useAssignInterviewers(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Interview, Error, AssignInterviewersInput>({
    mutationFn: (data) => interviewsService.assignInterviewers(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(interviewKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
    },
  })
}
