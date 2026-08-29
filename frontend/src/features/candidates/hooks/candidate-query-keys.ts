import type { CandidateFilterParams } from '../types/candidates.types'

export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (filters?: CandidateFilterParams) => [...candidateKeys.lists(), { ...filters }] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
  notes: (id: string) => [...candidateKeys.detail(id), 'notes'] as const,
  tags: (id: string) => [...candidateKeys.detail(id), 'tags'] as const,
  resume: (id: string) => [...candidateKeys.detail(id), 'resume'] as const,
}
