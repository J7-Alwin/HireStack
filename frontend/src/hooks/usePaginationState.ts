import { useState, useCallback, useMemo } from 'react'
import type { PaginationParams } from '@/types/pagination'

export interface UsePaginationStateOptions {
  readonly initialPage?: number
  readonly initialLimit?: number
}

export interface UsePaginationStateResult {
  readonly page: number
  readonly limit: number
  readonly setPage: (page: number) => void
  readonly setLimit: (limit: number) => void
  readonly nextPage: () => void
  readonly previousPage: () => void
  readonly resetPage: () => void
  readonly paginationParams: PaginationParams
}

export function usePaginationState(
  options: UsePaginationStateOptions = {}
): UsePaginationStateResult {
  const { initialPage = 1, initialLimit = 10 } = options

  const [page, setPage] = useState<number>(initialPage)
  const [limit, setLimit] = useState<number>(initialLimit)

  const nextPage = useCallback(() => setPage((p) => p + 1), [])
  const previousPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), [])
  const resetPage = useCallback(() => setPage(1), [])

  const paginationParams = useMemo<PaginationParams>(
    () => ({ page, limit }),
    [page, limit]
  )

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    previousPage,
    resetPage,
    paginationParams,
  }
}
