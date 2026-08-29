import { describe, it, expect } from 'vitest'
import {
  formatInterviewDate,
  formatInterviewTime,
  formatInterviewRange,
  calculateDurationMinutes,
  formatDuration,
} from '@/features/interviews/utils/interview-helpers'

describe('Interview Timezone & Date/Time Helpers', () => {
  it('formats interview date respecting timezone', () => {
    const isoString = '2026-06-15T00:00:00.000Z'
    const formattedUtc = formatInterviewDate(isoString, 'UTC')
    expect(formattedUtc).toContain('2026')
    expect(formattedUtc).toContain('Jun')
    expect(formattedUtc).toContain('15')

    const formattedAsia = formatInterviewDate(isoString, 'Asia/Kolkata')
    expect(formattedAsia).toContain('2026')
    expect(formattedAsia).toContain('Jun')
  })

  it('formats interview time correctly with timezone', () => {
    // 10:00 UTC = 15:30 IST (Asia/Kolkata)
    const isoString = '2026-06-15T10:00:00.000Z'
    const formattedUtc = formatInterviewTime(isoString, 'UTC')
    expect(formattedUtc).toBe('10:00 AM')

    const formattedIst = formatInterviewTime(isoString, 'Asia/Kolkata')
    expect(formattedIst).toBe('3:30 PM')
  })

  it('formats interview time range with timezone tag', () => {
    const startIso = '2026-06-15T10:00:00.000Z'
    const endIso = '2026-06-15T11:00:00.000Z'
    const range = formatInterviewRange(startIso, endIso, 'UTC')
    expect(range).toBe('10:00 AM – 11:00 AM (UTC)')
  })

  it('calculates duration in minutes accurately', () => {
    const startIso = '2026-06-15T10:00:00.000Z'
    const endIso = '2026-06-15T11:30:00.000Z'
    const duration = calculateDurationMinutes(startIso, endIso)
    expect(duration).toBe(90)
    expect(formatDuration(duration)).toBe('1 hr 30 mins')
  })

  it('formats exact hour duration', () => {
    expect(formatDuration(60)).toBe('1 hr')
    expect(formatDuration(120)).toBe('2 hr')
    expect(formatDuration(45)).toBe('45 mins')
  })

  it('handles invalid or empty date strings safely', () => {
    expect(formatInterviewDate('')).toBe('—')
    expect(formatInterviewDate('invalid-date')).toBe('—')
    expect(formatInterviewTime('')).toBe('—')
    expect(formatInterviewTime('invalid-time')).toBe('—')
    expect(formatInterviewRange('', '')).toBe('—')
    expect(calculateDurationMinutes('', '')).toBe(0)
    expect(formatDuration(0)).toBe('—')
  })
})
