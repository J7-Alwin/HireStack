import { describe, it, expect } from 'vitest'
import {
  formatSalary,
  formatOfferDate,
  formatOfferDateTime,
  getOfferStatusLabel,
  getEmploymentTypeLabel,
  getOfferStatusVariant,
  isOfferEditable,
  isOfferTerminal,
  getAllowedOfferTransitions,
} from '@/features/offers/utils/offer-helpers'

describe('Offer Money, Dates, and Lifecycle Helpers', () => {
  it('formats salaries across supported currencies without floating point issues', () => {
    expect(formatSalary(100000, 'USD')).toBe('$ 100,000')
    expect(formatSalary(850000, 'INR')).toBe('₹ 8,50,000')
    expect(formatSalary(75000, 'GBP')).toBe('£ 75,000')
    expect(formatSalary(90000, 'EUR')).toBe('€ 90.000')
    expect(formatSalary(300000, 'AED')).toBe('AED 300,000')
    expect(formatSalary(120000, 'SGD')).toBe('S$ 120,000')
  })

  it('handles zero, undefined, and null salary amounts safely', () => {
    expect(formatSalary(0, 'USD')).toBe('$ 0')
    expect(formatSalary(null, 'USD')).toBe('—')
    expect(formatSalary(undefined, 'USD')).toBe('—')
    expect(formatSalary(NaN, 'USD')).toBe('—')
  })

  it('formats offer dates and timestamps correctly', () => {
    const isoDate = '2026-06-15T00:00:00.000Z'
    const formattedDate = formatOfferDate(isoDate)
    expect(formattedDate).toContain('2026')
    expect(formattedDate).toContain('Jun')
    expect(formattedDate).toContain('15')

    const formattedTime = formatOfferDateTime('2026-06-15T14:30:00.000Z')
    expect(formattedTime).toContain('2026')
    expect(formattedTime).toContain('Jun')

    expect(formatOfferDate('')).toBe('—')
    expect(formatOfferDate('invalid')).toBe('—')
    expect(formatOfferDateTime('')).toBe('—')
    expect(formatOfferDateTime('invalid')).toBe('—')
  })

  it('returns appropriate labels and variants', () => {
    expect(getOfferStatusLabel('PENDING_APPROVAL')).toBe('Pending Approval')
    expect(getOfferStatusLabel('DRAFT')).toBe('Draft')
    expect(getOfferStatusLabel(null)).toBe('—')

    expect(getEmploymentTypeLabel('FULL_TIME')).toBe('Full Time')
    expect(getEmploymentTypeLabel('CONTRACT')).toBe('Contract')
    expect(getEmploymentTypeLabel(null)).toBe('—')

    expect(getOfferStatusVariant('ACCEPTED')).toBe('success')
    expect(getOfferStatusVariant('DECLINED')).toBe('error')
    expect(getOfferStatusVariant('DRAFT')).toBe('neutral')
  })

  it('determines editability and terminal status correctly', () => {
    expect(isOfferEditable('DRAFT')).toBe(true)
    expect(isOfferEditable('PENDING_APPROVAL')).toBe(false)
    expect(isOfferEditable('APPROVED')).toBe(false)

    expect(isOfferTerminal('ACCEPTED')).toBe(true)
    expect(isOfferTerminal('DECLINED')).toBe(true)
    expect(isOfferTerminal('EXPIRED')).toBe(true)
    expect(isOfferTerminal('WITHDRAWN')).toBe(true)
    expect(isOfferTerminal('DRAFT')).toBe(false)
    expect(isOfferTerminal('SENT')).toBe(false)
  })

  it('returns valid state machine transitions', () => {
    expect(getAllowedOfferTransitions('DRAFT')).toEqual(['PENDING_APPROVAL'])
    expect(getAllowedOfferTransitions('PENDING_APPROVAL')).toEqual(['APPROVED'])
    expect(getAllowedOfferTransitions('APPROVED')).toEqual(['SENT', 'WITHDRAWN'])
    expect(getAllowedOfferTransitions('SENT')).toEqual(['VIEWED', 'EXPIRED', 'WITHDRAWN'])
    expect(getAllowedOfferTransitions('VIEWED')).toEqual(['ACCEPTED', 'DECLINED', 'WITHDRAWN'])
    expect(getAllowedOfferTransitions('ACCEPTED')).toEqual([])
  })
})
