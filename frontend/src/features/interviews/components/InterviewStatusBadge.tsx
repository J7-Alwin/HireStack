import { AtsStatusBadge } from '@/components/ats'
import type { InterviewStatus } from '../types/interviews.types'

export interface InterviewStatusBadgeProps {
  readonly status: InterviewStatus
  readonly size?: 'sm' | 'md'
}

export function InterviewStatusBadge({ status, size = 'sm' }: InterviewStatusBadgeProps) {
  return <AtsStatusBadge status={status} size={size} />
}
