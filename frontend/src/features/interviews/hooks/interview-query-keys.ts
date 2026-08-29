import type { InterviewFilterParams } from '../types/interviews.types'

export const interviewKeys = {
  all: ['interviews'] as const,
  lists: () => [...interviewKeys.all, 'list'] as const,
  list: (params?: InterviewFilterParams) =>
    params
      ? ([...interviewKeys.lists(), params] as const)
      : ([...interviewKeys.lists()] as const),
  details: () => [...interviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...interviewKeys.details(), id] as const,
  feedback: (id: string) => [...interviewKeys.detail(id), 'feedback'] as const,
}
