import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../button'

export interface PaginationProps {
  readonly currentPage: number
  readonly totalPages: number
  readonly onPageChange: (page: number) => void
  readonly totalItems?: number
  readonly itemsPerPage?: number
  readonly disabled?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1 && totalItems === undefined) {
    return null
  }

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    pages.push(1)

    if (currentPage > 3) {
      pages.push('ellipsis')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis')
    }

    pages.push(totalPages)

    return pages
  }

  const pages = getPageNumbers()

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        padding: '12px 0',
        width: '100%',
      }}
      className="hs-pagination"
    >
      {totalItems !== undefined && (
        <p
          style={{
            fontSize: 'var(--text-caption)',
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}
        >
          {itemsPerPage
            ? `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to ${Math.min(
                currentPage * itemsPerPage,
                totalItems
              )} of ${totalItems} results`
            : `Total ${totalItems} items`}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          iconLeft={<ChevronLeft style={{ width: '16px', height: '16px' }} />}
        >
          Previous
        </Button>

        {pages.map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '0 8px',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-caption)',
                  userSelect: 'none',
                }}
                aria-hidden="true"
              >
                …
              </span>
            )
          }

          const isCurrent = p === currentPage

          return (
            <button
              key={p}
              type="button"
              disabled={disabled}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${p}`}
              onClick={() => onPageChange(p)}
              style={{
                minWidth: '32px',
                height: '32px',
                padding: '0 6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-caption)',
                fontWeight: isCurrent ? 600 : 500,
                color: isCurrent ? 'var(--color-white)' : 'var(--color-text-primary)',
                backgroundColor: isCurrent ? 'var(--color-charcoal)' : 'transparent',
                border: isCurrent ? '1px solid var(--color-charcoal)' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {p}
            </button>
          )
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={disabled || currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          iconRight={<ChevronRight style={{ width: '16px', height: '16px' }} />}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
