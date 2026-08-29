/**
 * Format a number consistently with thousands separators.
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Format an ISO date string to a human-readable date.
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/**
 * Format an ISO date string to a human-readable date & time.
 */
export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

}

/**
 * Format a stage enum value into a readable display string.
 */
export function formatPipelineStage(stage: string): string {
  switch (stage) {
    case 'APPLIED':
      return 'Applied'
    case 'SCREENING':
      return 'Screening'
    case 'SHORTLISTED':
      return 'Shortlisted'
    case 'HR_INTERVIEW':
      return 'HR Interview'
    case 'TECHNICAL_INTERVIEW':
      return 'Tech Interview'
    case 'FINAL_INTERVIEW':
      return 'Final Interview'
    case 'OFFER_PENDING':
      return 'Offer Pending'
    case 'OFFER_SENT':
      return 'Offer Sent'
    case 'OFFER_ACCEPTED':
      return 'Offer Accepted'
    case 'HIRED':
      return 'Hired'
    case 'REJECTED':
      return 'Rejected'
    case 'WITHDRAWN':
      return 'Withdrawn'
    default:
      return stage
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
  }
}
