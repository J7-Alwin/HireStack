import { describe, it, expect } from 'vitest'
import {
  formatAtsStatusLabel,
  getAtsStatusVariant,
} from '@/utils/ats'

describe('ATS Status Helpers', () => {
  it('formats status labels across all domains correctly', () => {
    // Candidates
    expect(formatAtsStatusLabel('ACTIVE')).toBe('Active')
    expect(formatAtsStatusLabel('BLACKLISTED')).toBe('Blacklisted')

    // Jobs
    expect(formatAtsStatusLabel('OPEN')).toBe('Open')
    expect(formatAtsStatusLabel('ARCHIVED')).toBe('Archived')

    // Applications & Stages
    expect(formatAtsStatusLabel('TECHNICAL_INTERVIEW')).toBe('Technical Interview')
    expect(formatAtsStatusLabel('OFFER_PENDING')).toBe('Offer Pending')

    // Interviews
    expect(formatAtsStatusLabel('SCHEDULED')).toBe('Scheduled')
    expect(formatAtsStatusLabel('NO_SHOW')).toBe('No Show')

    // Offers
    expect(formatAtsStatusLabel('PENDING_APPROVAL')).toBe('Pending Approval')
    expect(formatAtsStatusLabel('ACCEPTED')).toBe('Accepted')

    // Fallbacks
    expect(formatAtsStatusLabel(null)).toBe('—')
    expect(formatAtsStatusLabel(undefined)).toBe('—')
  })

  it('maps statuses to semantic BadgeVariants', () => {
    expect(getAtsStatusVariant('ACTIVE')).toBe('success')
    expect(getAtsStatusVariant('OPEN')).toBe('success')
    expect(getAtsStatusVariant('HIRED')).toBe('success')

    expect(getAtsStatusVariant('REJECTED')).toBe('error')
    expect(getAtsStatusVariant('CANCELLED')).toBe('error')
    expect(getAtsStatusVariant('BLACKLISTED')).toBe('error')

    expect(getAtsStatusVariant('PENDING_APPROVAL')).toBe('warning')
    expect(getAtsStatusVariant('PAUSED')).toBe('warning')

    expect(getAtsStatusVariant('SHORTLISTED')).toBe('accent')
    expect(getAtsStatusVariant('TECHNICAL_INTERVIEW')).toBe('accent')

    expect(getAtsStatusVariant('DRAFT')).toBe('neutral')
    expect(getAtsStatusVariant('ARCHIVED')).toBe('neutral')
    expect(getAtsStatusVariant(null)).toBe('neutral')
  })
})
