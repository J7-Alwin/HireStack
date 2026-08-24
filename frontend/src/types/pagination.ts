export type SortOrder = 'asc' | 'desc'

/**
 * Backend Pagination & Sorting Query Parameters
 */
export interface PaginationParams {
  readonly page?: number
  readonly limit?: number
  readonly sortBy?: string
  readonly sortOrder?: SortOrder
}

/**
 * Backend Pagination Metadata
 */
export interface PaginationMeta {
  readonly page: number
  readonly limit: number
  readonly total: number
  readonly totalPages: number
}

/**
 * Paginated Result Container
 */
export interface PaginatedResult<T> {
  readonly data: readonly T[]
  readonly meta: PaginationMeta
}

/**
 * Generic Filter Parameters Dictionary
 */
export type FilterParams = Record<
  string,
  string | number | boolean | readonly (string | number)[] | undefined | null
>

/**
 * Combined Query Parameters
 */
export interface QueryListParams extends PaginationParams {
  readonly search?: string
  readonly [key: string]: string | number | boolean | readonly (string | number)[] | undefined | null
}
