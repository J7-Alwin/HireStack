import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Hook for syncing and managing URL query parameters with react-router-dom.
 */
export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo(() => {
    const result: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      result[key] = value
    })
    return result
  }, [searchParams])

  const setParam = useCallback(
    (key: string, value: string | number | boolean | undefined | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value === undefined || value === null || value === '') {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
        return next
      })
    },
    [setSearchParams]
  )

  const setMultipleParams = useCallback(
    (updates: Record<string, string | number | boolean | undefined | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined || value === null || value === '') {
            next.delete(key)
          } else {
            next.set(key, String(value))
          }
        }
        return next
      })
    },
    [setSearchParams]
  )

  const deleteParam = useCallback(
    (key: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete(key)
        return next
      })
    },
    [setSearchParams]
  )

  const clearAllParams = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  return {
    params,
    searchParams,
    setParam,
    setMultipleParams,
    deleteParam,
    clearAllParams,
  }
}
