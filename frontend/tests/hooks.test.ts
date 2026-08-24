import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  useDebouncedValue,
  usePaginationState,
  useFilterState,
  useSortState,
} from '@/hooks'
import type { FilterParams } from '@/types/pagination'

describe('Custom State & Data Hooks', () => {
  describe('useDebouncedValue', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('debounces rapid value changes', () => {
      const { result, rerender } = renderHook(
        ({ val }) => useDebouncedValue(val, 300),
        { initialProps: { val: 'first' } }
      )

      expect(result.current).toBe('first')

      rerender({ val: 'second' })
      expect(result.current).toBe('first')

      act(() => {
        vi.advanceTimersByTime(299)
      })
      expect(result.current).toBe('first')

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(result.current).toBe('second')
    })
  })

  describe('usePaginationState', () => {
    it('handles page navigation, limits, and reset', () => {
      const { result } = renderHook(() =>
        usePaginationState({ initialPage: 1, initialLimit: 20 })
      )

      expect(result.current.page).toBe(1)
      expect(result.current.limit).toBe(20)
      expect(result.current.paginationParams).toEqual({ page: 1, limit: 20 })

      act(() => {
        result.current.nextPage()
      })
      expect(result.current.page).toBe(2)

      act(() => {
        result.current.previousPage()
      })
      expect(result.current.page).toBe(1)

      act(() => {
        result.current.setLimit(50)
      })
      expect(result.current.limit).toBe(50)

      act(() => {
        result.current.setPage(4)
      })
      expect(result.current.page).toBe(4)

      act(() => {
        result.current.resetPage()
      })
      expect(result.current.page).toBe(1)
    })
  })

  describe('useFilterState', () => {
    it('manages typed filter state, active counts, and resets', () => {
      interface MockFilters extends FilterParams {
        status?: string
        department?: string
        remoteOnly?: boolean
      }

      const initial: MockFilters = {
        status: 'ALL',
        department: undefined,
        remoteOnly: false,
      }

      const { result } = renderHook(() => useFilterState<MockFilters>(initial))

      expect(result.current.filters).toEqual(initial)
      expect(result.current.activeFilterCount).toBe(0)

      act(() => {
        result.current.setFilter('status', 'ACTIVE')
      })
      expect(result.current.filters.status).toBe('ACTIVE')
      expect(result.current.activeFilterCount).toBe(1)

      act(() => {
        result.current.setFilter('remoteOnly', true)
      })
      expect(result.current.activeFilterCount).toBe(2)

      act(() => {
        result.current.clearFilter('status')
      })
      expect(result.current.filters.status).toBeUndefined()

      act(() => {
        result.current.clearAllFilters()
      })
      expect(result.current.filters).toEqual(initial)
      expect(result.current.activeFilterCount).toBe(0)
    })
  })

  describe('useSortState', () => {
    it('toggles sort directions and resets cleanly', () => {
      const { result } = renderHook(() =>
        useSortState({ initialSortBy: 'createdAt', initialSortOrder: 'desc' })
      )

      expect(result.current.sortBy).toBe('createdAt')
      expect(result.current.sortOrder).toBe('desc')
      expect(result.current.sortParams).toEqual({
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      // Toggle new field: defaults to asc
      act(() => {
        result.current.toggleSort('name')
      })
      expect(result.current.sortBy).toBe('name')
      expect(result.current.sortOrder).toBe('asc')

      // Toggle same field: goes to desc
      act(() => {
        result.current.toggleSort('name')
      })
      expect(result.current.sortOrder).toBe('desc')

      // Toggle same field again: goes to undefined/unsorted
      act(() => {
        result.current.toggleSort('name')
      })
      expect(result.current.sortOrder).toBeUndefined()

      // Reset
      act(() => {
        result.current.resetSort()
      })
      expect(result.current.sortBy).toBe('createdAt')
      expect(result.current.sortOrder).toBe('desc')
    })
  })
})
