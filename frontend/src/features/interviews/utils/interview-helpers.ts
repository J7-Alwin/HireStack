import type {
  InterviewStatus,
  InterviewType,
  InterviewRound,
  InterviewMode,
  InterviewOutcome,
} from '../types/interviews.types'

/**
 * Valid state transitions matching backend STATUS_TRANSITION_RULES
 */
export const STATUS_TRANSITION_RULES: Record<InterviewStatus, readonly InterviewStatus[]> = {
  SCHEDULED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

/**
 * Returns allowed next statuses for a given interview status
 */
export function getAllowedStatusTransitions(status: InterviewStatus): readonly InterviewStatus[] {
  return STATUS_TRANSITION_RULES[status] || []
}

/**
 * Determines if an interview is in a terminal status
 */
export function isTerminalStatus(status: InterviewStatus): boolean {
  return status === 'COMPLETED' || status === 'CANCELLED' || status === 'NO_SHOW'
}

/**
 * Human-readable label for InterviewStatus
 */
export function getStatusLabel(status: InterviewStatus): string {
  switch (status) {
    case 'SCHEDULED':
      return 'Scheduled'
    case 'CONFIRMED':
      return 'Confirmed'
    case 'IN_PROGRESS':
      return 'In Progress'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'NO_SHOW':
      return 'No Show'
    default:
      return status
  }
}

/**
 * Human-readable label for InterviewType
 */
export function getInterviewTypeLabel(type: InterviewType): string {
  switch (type) {
    case 'INTERNAL':
      return 'Internal'
    case 'CLIENT':
      return 'Client'
    case 'CAMPUS':
      return 'Campus'
    case 'WALK_IN':
      return 'Walk-In'
    case 'OTHER':
      return 'Other'
    default:
      return type
  }
}

/**
 * Human-readable label for InterviewRound
 */
export function getRoundLabel(round: InterviewRound): string {
  switch (round) {
    case 'SCREENING':
      return 'Screening Round'
    case 'TECHNICAL':
      return 'Technical Round'
    case 'MANAGERIAL':
      return 'Managerial Round'
    case 'HR':
      return 'HR Round'
    case 'FINAL':
      return 'Final Round'
    default:
      return round
  }
}

/**
 * Human-readable label for InterviewMode
 */
export function getModeLabel(mode: InterviewMode): string {
  switch (mode) {
    case 'ONLINE':
      return 'Online Video'
    case 'ONSITE':
      return 'On-Site'
    case 'PHONE':
      return 'Phone'
    default:
      return mode
  }
}

/**
 * Human-readable label for InterviewOutcome
 */
export function getOutcomeLabel(outcome: InterviewOutcome): string {
  switch (outcome) {
    case 'PASS':
      return 'Passed'
    case 'FAIL':
      return 'Failed'
    case 'ON_HOLD':
      return 'On Hold'
    case 'RECOMMENDED':
      return 'Recommended'
    case 'STRONG_RECOMMEND':
      return 'Strongly Recommended'
    case 'NOT_RECOMMENDED':
      return 'Not Recommended'
    default:
      return outcome
  }
}

/**
 * Badge variant for InterviewOutcome
 */
export function getOutcomeVariant(
  outcome?: InterviewOutcome | null
): 'neutral' | 'success' | 'warning' | 'error' | 'info' {
  if (!outcome) return 'neutral'
  switch (outcome) {
    case 'PASS':
    case 'STRONG_RECOMMEND':
    case 'RECOMMENDED':
      return 'success'
    case 'FAIL':
    case 'NOT_RECOMMENDED':
      return 'error'
    case 'ON_HOLD':
      return 'warning'
    default:
      return 'neutral'
  }
}

/**
 * Safe date formatter with optional timezone
 */
export function formatInterviewDate(dateStr: string, timeZone?: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'

  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: timeZone || undefined,
    }).format(date)
  } catch {
    return date.toLocaleDateString()
  }
}

/**
 * Safe time formatter with optional timezone
 */
export function formatInterviewTime(timeStr: string, timeZone?: string): string {
  if (!timeStr) return '—'
  const date = new Date(timeStr)
  if (isNaN(date.getTime())) return '—'

  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timeZone || undefined,
    }).format(date)
  } catch {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

/**
 * Formats time range (e.g. "10:00 AM – 11:00 AM (Asia/Kolkata)")
 */
export function formatInterviewRange(
  startTimeStr: string,
  endTimeStr: string,
  timeZone?: string
): string {
  const start = formatInterviewTime(startTimeStr, timeZone)
  const end = formatInterviewTime(endTimeStr, timeZone)
  if (start === '—' || end === '—') return '—'
  const tzSuffix = timeZone ? ` (${timeZone})` : ''
  return `${start} – ${end}${tzSuffix}`
}

/**
 * Calculates interview duration in minutes
 */
export function calculateDurationMinutes(startTimeStr: string, endTimeStr: string): number {
  if (!startTimeStr || !endTimeStr) return 0
  const start = new Date(startTimeStr).getTime()
  const end = new Date(endTimeStr).getTime()
  if (isNaN(start) || isNaN(end) || end <= start) return 0
  return Math.round((end - start) / (1000 * 60))
}

/**
 * Formats duration into human-readable string (e.g., "45 mins", "1 hr", "1 hr 30 mins")
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '—'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} mins`
  if (hours > 0) return `${hours} hr`
  return `${mins} mins`
}
