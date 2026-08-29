import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsService } from '../services/jobs.service'
import { jobKeys } from './job-query-keys'
import type { Job } from '../types/jobs.types'

export function usePublishJob() {
  const queryClient = useQueryClient()
  return useMutation<Job, Error, string>({
    mutationFn: (id) => jobsService.publishJob(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

export function useOpenJob() {
  const queryClient = useQueryClient()
  return useMutation<Job, Error, string>({
    mutationFn: (id) => jobsService.openJob(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

export function usePauseJob() {
  const queryClient = useQueryClient()
  return useMutation<Job, Error, string>({
    mutationFn: (id) => jobsService.pauseJob(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

export function useReopenJob() {
  const queryClient = useQueryClient()
  return useMutation<Job, Error, string>({
    mutationFn: (id) => jobsService.reopenJob(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

export function useCloseJob() {
  const queryClient = useQueryClient()
  return useMutation<Job, Error, string>({
    mutationFn: (id) => jobsService.closeJob(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

export function useArchiveJob() {
  const queryClient = useQueryClient()
  return useMutation<Job, Error, string>({
    mutationFn: (id) => jobsService.archiveJob(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}
