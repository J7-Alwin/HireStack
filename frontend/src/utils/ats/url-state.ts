/**
 * Base pagination and sorting query parameters for all ATS list endpoints
 */
export interface AtsBaseQueryParams {
  readonly page?: number
  readonly limit?: number
  readonly search?: string
  readonly sortBy?: string
  readonly sortOrder?: 'asc' | 'desc'
  readonly [key: string]: unknown
}

/**
 * Parse URLSearchParams into typed ATS query parameters
 */
export function parseAtsQueryParams<T extends AtsBaseQueryParams>(
  searchParams: URLSearchParams,
  defaults: Partial<T> = {}
): T {
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const searchParam = searchParams.get('search')
  const sortByParam = searchParams.get('sortBy')
  const sortOrderParam = searchParams.get('sortOrder')

  const parsed: Record<string, unknown> = { ...defaults }

  const pageNum = pageParam ? Number(pageParam) : NaN
  if (!isNaN(pageNum) && pageNum > 0) {
    parsed.page = pageNum
  } else if (defaults.page !== undefined) {
    parsed.page = defaults.page
  } else {
    parsed.page = 1
  }

  const limitNum = limitParam ? Number(limitParam) : NaN
  if (!isNaN(limitNum) && limitNum > 0) {
    parsed.limit = limitNum
  } else if (defaults.limit !== undefined) {
    parsed.limit = defaults.limit
  } else {
    parsed.limit = 10
  }

  if (searchParam !== null) {
    parsed.search = searchParam.trim()
  }

  if (sortByParam) {
    parsed.sortBy = sortByParam
  }

  if (sortOrderParam === 'asc' || sortOrderParam === 'desc') {
    parsed.sortOrder = sortOrderParam
  }

  // Parse all additional query parameters
  searchParams.forEach((value, key) => {
    if (!['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)) {
      if (value === 'true') {
        parsed[key] = true
      } else if (value === 'false') {
        parsed[key] = false
      } else if (value !== '') {
        parsed[key] = value
      }
    }
  })

  return parsed as T
}

/**
 * Serialize typed ATS parameters into URLSearchParams
 */
export function serializeAtsQueryParams<T extends AtsBaseQueryParams>(
  params: T,
  defaults: Partial<T> = {}
): URLSearchParams {
  const searchParams = new URLSearchParams()

  const page = params.page ?? defaults.page ?? 1
  if (page > 1) {
    searchParams.set('page', String(page))
  }

  const limit = params.limit ?? defaults.limit ?? 10
  if (limit !== 10 && limit !== defaults.limit) {
    searchParams.set('limit', String(limit))
  }

  if (params.search && params.search.trim()) {
    searchParams.set('search', params.search.trim())
  }

  if (params.sortBy && params.sortBy !== defaults.sortBy) {
    searchParams.set('sortBy', params.sortBy)
  }

  if (params.sortOrder && params.sortOrder !== defaults.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder)
  }

  Object.entries(params).forEach(([key, value]) => {
    if (!['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)) {
      if (value !== undefined && value !== null && value !== '' && value !== defaults[key]) {
        searchParams.set(key, String(value))
      }
    }
  })

  return searchParams
}
