import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAtsUrlParams } from '@/hooks/useAtsUrlParams'
import type { AtsBaseQueryParams } from '@/utils/ats'
import type { ReactNode } from 'react'

describe('useAtsUrlParams Hook', () => {
  interface FilterParams extends AtsBaseQueryParams {
    departmentId?: string
    status?: string
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/app/jobs?page=2&status=OPEN']}>
      {children}
    </MemoryRouter>
  )

  it('initializes with parsed params from URL', () => {
    const { result } = renderHook(
      () => useAtsUrlParams<FilterParams>({ defaults: { limit: 10 } }),
      { wrapper }
    )

    expect(result.current.params.page).toBe(2)
    expect(result.current.params.status).toBe('OPEN')
    expect(result.current.params.limit).toBe(10)
  })

  it('resets page to 1 automatically when filters or search change', () => {
    const { result } = renderHook(
      () => useAtsUrlParams<FilterParams>({ defaults: { page: 1, limit: 10 } }),
      { wrapper }
    )

    act(() => {
      result.current.setSearch('frontend')
    })

    expect(result.current.params.search).toBe('frontend')
    expect(result.current.params.page).toBe(1)
  })

  it('updates page directly without affecting other filters', () => {
    const { result } = renderHook(
      () => useAtsUrlParams<FilterParams>({ defaults: { limit: 10 } }),
      { wrapper }
    )

    act(() => {
      result.current.setPage(5)
    })

    expect(result.current.params.page).toBe(5)
    expect(result.current.params.status).toBe('OPEN')
  })

  it('resets all params to defaults', () => {
    const { result } = renderHook(
      () =>
        useAtsUrlParams<FilterParams>({
          defaults: { page: 1, limit: 10, status: 'ALL' },
        }),
      { wrapper }
    )

    act(() => {
      result.current.resetParams()
    })

    expect(result.current.params.page).toBe(1)
    expect(result.current.params.status).toBe('ALL')
  })
})
