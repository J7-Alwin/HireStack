import { useState, useCallback, useMemo } from 'react'
import type { SortOrder } from '@/types/pagination'

export interface UseSortStateOptions {
  readonly initialSortBy?: string
  readonly initialSortOrder?: SortOrder
}

export interface UseSortStateResult {
  readonly sortBy?: string
  readonly sortOrder?: SortOrder
  readonly setSort: (sortBy?: string, sortOrder?: SortOrder) => void
  readonly toggleSort: (field: string) => void
  readonly resetSort: () => void
  readonly sortParams: { readonly sortBy?: string; readonly sortOrder?: SortOrder }
}

export function useSortState(options: UseSortStateOptions = {}): UseSortStateResult {
  const { initialSortBy, initialSortOrder = 'asc' } = options

  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy)
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(
    initialSortBy ? initialSortOrder : undefined
  )

  const setSort = useCallback((field?: string, order?: SortOrder) => {
    setSortBy(field)
    setSortOrder(order)
  }, [])

  const toggleSort = useCallback((field: string) => {
    setSortBy((prevField) => {
      if (prevField !== field) {
        setSortOrder('asc')
        return field
      }

      setSortOrder((prevOrder) => {
        if (prevOrder === 'asc') return 'desc'
        if (prevOrder === 'desc') return undefined
        return 'asc'
      })

      return prevField
    })
  }, [])

  const resetSort = useCallback(() => {
    setSortBy(initialSortBy)
    setSortOrder(initialSortOrder)
  }, [initialSortBy, initialSortOrder])

  const sortParams = useMemo(
    () => ({
      sortBy: sortOrder ? sortBy : undefined,
      sortOrder: sortBy ? sortOrder : undefined,
    }),
    [sortBy, sortOrder]
  )

  return {
    sortBy,
    sortOrder,
    setSort,
    toggleSort,
    resetSort,
    sortParams,
  }
}
