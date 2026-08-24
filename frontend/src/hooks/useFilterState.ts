import { useState, useCallback, useMemo } from 'react'
import type { FilterParams } from '@/types/pagination'

export interface UseFilterStateResult<T extends FilterParams> {
  readonly filters: T
  readonly setFilter: <K extends keyof T>(key: K, value: T[K]) => void
  readonly setFilters: (newFilters: Partial<T> | ((prev: T) => T)) => void
  readonly clearFilter: (key: keyof T) => void
  readonly clearAllFilters: () => void
  readonly activeFilterCount: number
}

export function useFilterState<T extends FilterParams>(
  initialFilters: T
): UseFilterStateResult<T> {
  const [filters, setFiltersInternal] = useState<T>(initialFilters)

  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFiltersInternal((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const setFilters = useCallback((newFilters: Partial<T> | ((prev: T) => T)) => {
    if (typeof newFilters === 'function') {
      setFiltersInternal(newFilters as (prev: T) => T)
    } else {
      setFiltersInternal((prev) => ({
        ...prev,
        ...newFilters,
      }))
    }
  }, [])

  const clearFilter = useCallback((key: keyof T) => {
    setFiltersInternal((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFiltersInternal(initialFilters)
  }, [initialFilters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    for (const [key, value] of Object.entries(filters)) {
      const initialValue = initialFilters[key]
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        JSON.stringify(value) !== JSON.stringify(initialValue)
      ) {
        count++
      }
    }
    return count
  }, [filters, initialFilters])

  return {
    filters,
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
    activeFilterCount,
  }
}
