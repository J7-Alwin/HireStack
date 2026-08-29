import type { PipelineQueryFilters } from '../types/pipeline.types'

export const pipelineKeys = {
  all: ['pipeline'] as const,
  lists: () => [...pipelineKeys.all, 'list'] as const,
  list: (filters?: PipelineQueryFilters) =>
    [...pipelineKeys.lists(), filters ?? {}] as const,
  details: () => [...pipelineKeys.all, 'detail'] as const,
  detail: (id: string) => [...pipelineKeys.details(), id] as const,
  histories: () => [...pipelineKeys.all, 'history'] as const,
  history: (id: string) => [...pipelineKeys.histories(), id] as const,
  timelines: () => [...pipelineKeys.all, 'timeline'] as const,
  timeline: (id: string) => [...pipelineKeys.timelines(), id] as const,
  dashboard: () => [...pipelineKeys.all, 'dashboard'] as const,
  company: () => [...pipelineKeys.dashboard(), 'company'] as const,
  recruiter: () => [...pipelineKeys.dashboard(), 'recruiter'] as const,
  stages: () => [...pipelineKeys.all, 'stages'] as const,
  job: (jobId: string) => [...pipelineKeys.all, 'job', jobId] as const,
  transitions: (applicationId: string) =>
    [...pipelineKeys.all, 'transitions', applicationId] as const,
}
