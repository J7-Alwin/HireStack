import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  parseAtsQueryParams,
  serializeAtsQueryParams,
  type AtsBaseQueryParams,
} from '@/utils/ats'

export interface UseAtsUrlParamsOptions<T extends AtsBaseQueryParams> {
  readonly defaults?: Partial<T>
  readonly replace?: boolean
}

export function useAtsUrlParams<T extends AtsBaseQueryParams>(
  options: UseAtsUrlParamsOptions<T> = {}
) {
  const { defaults = {}, replace = true } = options
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo<T>(() => {
    return parseAtsQueryParams<T>(searchParams, defaults)
  }, [searchParams, defaults])

  const setParams = useCallback(
    (newParams: Partial<T> | ((prev: T) => Partial<T>)) => {
      setSearchParams(
        (prevSearchParams) => {
          const current = parseAtsQueryParams<T>(prevSearchParams, defaults)
          const updates =
            typeof newParams === 'function' ? newParams(current) : newParams

          // If search or filters change without explicit page change, reset page to 1
          const shouldResetPage =
            !('page' in updates) &&
            Object.keys(updates).some((key) => key !== 'sortBy' && key !== 'sortOrder')

          const merged: T = {
            ...current,
            ...updates,
            ...(shouldResetPage ? { page: 1 } : {}),
          }

          return serializeAtsQueryParams<T>(merged, defaults)
        },
        { replace }
      )
    },
    [defaults, replace, setSearchParams]
  )

  const setParam = useCallback(
    <K extends keyof T>(key: K, value: T[K] | undefined) => {
      setParams({ [key]: value } as unknown as Partial<T>)
    },
    [setParams]
  )

  const resetParams = useCallback(() => {
    setSearchParams(serializeAtsQueryParams(defaults as T, defaults), {
      replace,
    })
  }, [defaults, replace, setSearchParams])

  const setPage = useCallback(
    (page: number) => {
      setParam('page' as keyof T, page as unknown as T[keyof T])
    },
    [setParam]
  )

  const setSearch = useCallback(
    (search: string) => {
      setParam('search' as keyof T, search as unknown as T[keyof T])
    },
    [setParam]
  )

  return {
    params,
    setParams,
    setParam,
    resetParams,
    setPage,
    setSearch,
  }
}
