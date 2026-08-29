import type { BadgeVariant } from '@/components/ui'

/**
 * Format any raw enum or uppercase string into Title Case label
 */
export function formatAtsStatusLabel(status?: string | null): string {
  if (!status) return '—'

  const customLabels: Record<string, string> = {
    // Candidates
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    HIRED: 'Hired',
    REJECTED: 'Rejected',
    BLACKLISTED: 'Blacklisted',

    // Jobs
    DRAFT: 'Draft',
    OPEN: 'Open',
    PAUSED: 'Paused',
    CLOSED: 'Closed',
    ARCHIVED: 'Archived',

    // Applications & Stages
    APPLIED: 'Applied',
    SCREENING: 'Screening',
    SHORTLISTED: 'Shortlisted',
    HR_INTERVIEW: 'HR Interview',
    TECHNICAL_INTERVIEW: 'Technical Interview',
    FINAL_INTERVIEW: 'Final Interview',
    OFFER_PENDING: 'Offer Pending',
    OFFER_SENT: 'Offer Sent',
    OFFER_ACCEPTED: 'Offer Accepted',
    WITHDRAWN: 'Withdrawn',

    // Interviews
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    RESCHEDULED: 'Rescheduled',
    NO_SHOW: 'No Show',

    // Offers
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    SENT: 'Sent',
    ACCEPTED: 'Accepted',
  }

  if (customLabels[status]) {
    return customLabels[status]
  }

  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Map backend status/stage values to BadgeVariant colors
 */
export function getAtsStatusVariant(status?: string | null): BadgeVariant {
  if (!status) return 'neutral'

  switch (status.toUpperCase()) {
    // Success / Completed / Hired / Accepted / Open
    case 'ACTIVE':
    case 'OPEN':
    case 'HIRED':
    case 'OFFER_ACCEPTED':
    case 'ACCEPTED':
    case 'APPROVED':
    case 'COMPLETED':
      return 'success'

    // Error / Rejected / Cancelled / Blacklisted
    case 'REJECTED':
    case 'CANCELLED':
    case 'BLACKLISTED':
    case 'NO_SHOW':
      return 'error'

    // Warning / Pending / Paused / Inactive / Rescheduled
    case 'PENDING_APPROVAL':
    case 'OFFER_PENDING':
    case 'OFFER_SENT':
    case 'PAUSED':
    case 'INACTIVE':
    case 'RESCHEDULED':
      return 'warning'

    // Accent / Info / Progress / Shortlisted / Interviewing
    case 'SHORTLISTED':
    case 'SCREENING':
    case 'HR_INTERVIEW':
    case 'TECHNICAL_INTERVIEW':
    case 'FINAL_INTERVIEW':
    case 'SCHEDULED':
    case 'SENT':
      return 'accent'

    // Neutral / Draft / Closed / Archived / Withdrawn
    case 'DRAFT':
    case 'CLOSED':
    case 'ARCHIVED':
    case 'WITHDRAWN':
    case 'APPLIED':
    default:
      return 'neutral'
  }
}
