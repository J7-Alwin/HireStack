import type { ApplicationFilterParams } from '../types/applications.types'

export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters?: ApplicationFilterParams) =>
    [...applicationKeys.lists(), { ...filters }] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  timeline: (id: string) => [...applicationKeys.detail(id), 'timeline'] as const,
  notes: (id: string) => [...applicationKeys.detail(id), 'notes'] as const,
}
