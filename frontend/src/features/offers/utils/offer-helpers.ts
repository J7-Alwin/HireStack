import type { BadgeVariant } from '@/components/ui'
import type {
  OfferStatus,
  OfferCurrency,
  EmploymentType,
} from '../types/offers.types'

/**
 * Currency Symbol and locale mappings
 */
const CURRENCY_CONFIG: Record<OfferCurrency, { locale: string; symbol: string }> = {
  INR: { locale: 'en-IN', symbol: '₹' },
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' },
  AED: { locale: 'ar-AE', symbol: 'AED' },
  SGD: { locale: 'en-SG', symbol: 'S$' },
}

/**
 * Formats monetary salary with currency preservation
 */
export function formatSalary(
  amount?: number | null,
  currency?: OfferCurrency | string | null
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '—'
  }

  const curr = (currency as OfferCurrency) || 'USD'
  const config = CURRENCY_CONFIG[curr] || { locale: 'en-US', symbol: curr }

  try {
    const formattedNum = new Intl.NumberFormat(config.locale, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount)

    return `${config.symbol} ${formattedNum}`
  } catch {
    return `${curr} ${amount.toLocaleString()}`
  }
}

/**
 * Formats standard offer dates (e.g. Joining Date, Expiry Date)
 */
export function formatOfferDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return '—'
  }
}

/**
 * Formats date and time timestamp
 */
export function formatOfferDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d)
  } catch {
    return '—'
  }
}

/**
 * Human-readable label for OfferStatus
 */
export function getOfferStatusLabel(status?: OfferStatus | string | null): string {
  if (!status) return '—'
  switch (status) {
    case 'DRAFT':
      return 'Draft'
    case 'PENDING_APPROVAL':
      return 'Pending Approval'
    case 'APPROVED':
      return 'Approved'
    case 'SENT':
      return 'Sent'
    case 'VIEWED':
      return 'Viewed'
    case 'ACCEPTED':
      return 'Accepted'
    case 'DECLINED':
      return 'Declined'
    case 'EXPIRED':
      return 'Expired'
    case 'WITHDRAWN':
      return 'Withdrawn'
    default:
      return status.replace(/_/g, ' ')
  }
}

/**
 * Human-readable label for EmploymentType
 */
export function getEmploymentTypeLabel(type?: EmploymentType | string | null): string {
  if (!type) return '—'
  switch (type) {
    case 'FULL_TIME':
      return 'Full Time'
    case 'PART_TIME':
      return 'Part Time'
    case 'CONTRACT':
      return 'Contract'
    case 'INTERN':
      return 'Intern'
    case 'TEMPORARY':
      return 'Temporary'
    case 'FREELANCE':
      return 'Freelance'
    default:
      return type.replace(/_/g, ' ')
  }
}

/**
 * BadgeVariant for OfferStatus
 */
export function getOfferStatusVariant(
  status?: OfferStatus | string | null
): BadgeVariant {
  if (!status) return 'neutral'
  switch (status) {
    case 'DRAFT':
      return 'neutral'
    case 'PENDING_APPROVAL':
      return 'warning'
    case 'APPROVED':
      return 'info'
    case 'SENT':
      return 'accent'
    case 'VIEWED':
      return 'info'
    case 'ACCEPTED':
      return 'success'
    case 'DECLINED':
    case 'EXPIRED':
      return 'error'
    case 'WITHDRAWN':
      return 'charcoal'
    default:
      return 'neutral'
  }
}

/**
 * Checks whether an offer is in an editable draft state
 */
export function isOfferEditable(status?: OfferStatus | null): boolean {
  return status === 'DRAFT'
}

/**
 * Checks whether an offer has reached a terminal immutable state
 */
export function isOfferTerminal(status?: OfferStatus | null): boolean {
  return (
    status === 'ACCEPTED' ||
    status === 'DECLINED' ||
    status === 'EXPIRED' ||
    status === 'WITHDRAWN'
  )
}

/**
 * Status Transition validation conforming to backend STATUS_TRANSITION_RULES
 */
export const OFFER_TRANSITION_RULES: Record<OfferStatus, OfferStatus[]> = {
  DRAFT: ['PENDING_APPROVAL'],
  PENDING_APPROVAL: ['APPROVED'],
  APPROVED: ['SENT', 'WITHDRAWN'],
  SENT: ['VIEWED', 'EXPIRED', 'WITHDRAWN'],
  VIEWED: ['ACCEPTED', 'DECLINED', 'WITHDRAWN'],
  ACCEPTED: [],
  DECLINED: [],
  EXPIRED: [],
  WITHDRAWN: [],
}

export function getAllowedOfferTransitions(status?: OfferStatus | null): OfferStatus[] {
  if (!status) return []
  return OFFER_TRANSITION_RULES[status] || []
}
