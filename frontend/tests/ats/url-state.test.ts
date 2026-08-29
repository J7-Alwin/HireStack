import { describe, it, expect } from 'vitest'
import {
  parseAtsQueryParams,
  serializeAtsQueryParams,
  type AtsBaseQueryParams,
} from '@/utils/ats'

describe('ATS URL State Utilities', () => {
  it('parses URLSearchParams with defaults and custom parameters', () => {
    const searchParams = new URLSearchParams(
      'page=3&limit=25&search=developer&sortBy=title&sortOrder=asc&status=OPEN&remote=true'
    )

    interface TestParams extends AtsBaseQueryParams {
      status?: string
      remote?: boolean
    }

    const parsed = parseAtsQueryParams<TestParams>(searchParams, {
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    expect(parsed.page).toBe(3)
    expect(parsed.limit).toBe(25)
    expect(parsed.search).toBe('developer')
    expect(parsed.sortBy).toBe('title')
    expect(parsed.sortOrder).toBe('asc')
    expect(parsed.status).toBe('OPEN')
    expect(parsed.remote).toBe(true)
  })

  it('falls back to defaults when URL parameters are invalid or omitted', () => {
    const searchParams = new URLSearchParams('page=invalid&limit=-5')

    const parsed = parseAtsQueryParams(searchParams, {
      page: 1,
      limit: 15,
      sortBy: 'createdAt',
    })

    expect(parsed.page).toBe(1)
    expect(parsed.limit).toBe(15)
    expect(parsed.sortBy).toBe('createdAt')
  })

  it('serializes typed parameters into URLSearchParams omitting defaults', () => {
    const params = {
      page: 2,
      limit: 10,
      search: 'engineer',
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
      status: 'ACTIVE',
    }

    const serialized = serializeAtsQueryParams(params, {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    expect(serialized.get('page')).toBe('2')
    expect(serialized.get('search')).toBe('engineer')
    expect(serialized.get('status')).toBe('ACTIVE')
    // Defaults are omitted from URL
    expect(serialized.get('limit')).toBeNull()
    expect(serialized.get('sortBy')).toBeNull()
    expect(serialized.get('sortOrder')).toBeNull()
  })
})
