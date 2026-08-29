import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  formatDate,
  formatDateTime,
  formatPipelineStage,
} from '@/features/dashboard/utils'

describe('dashboard-formatters', () => {
  it('formats numbers with thousands separators and handles null/undefined', () => {
    expect(formatNumber(1250)).toBe('1,250')
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(null)).toBe('0')
    expect(formatNumber(undefined)).toBe('0')
  })

  it('formats dates into readable strings and handles invalid dates', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('invalid-date')).toBe('—')
    const formatted = formatDate('2026-05-15T10:00:00Z')
    expect(formatted).toMatch(/May 15, 2026/)
  })

  it('formats date and time', () => {
    expect(formatDateTime(null)).toBe('—')
    const formatted = formatDateTime('2026-05-15T14:30:00Z')
    expect(formatted).toContain('2026')
  })

  it('formats pipeline stage enum values into humanized labels', () => {
    expect(formatPipelineStage('APPLIED')).toBe('Applied')
    expect(formatPipelineStage('TECHNICAL_INTERVIEW')).toBe('Tech Interview')
    expect(formatPipelineStage('OFFER_ACCEPTED')).toBe('Offer Accepted')
    expect(formatPipelineStage('CUSTOM_STAGE')).toBe('Custom Stage')
  })
})
