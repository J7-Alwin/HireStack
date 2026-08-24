import { type ReactNode } from 'react'
import { Skeleton } from '../skeleton'
import { EmptyState } from '../empty-state'
import { ErrorState } from '../error-state'

export interface ColumnDef<T> {
  readonly id: string
  readonly header: ReactNode
  readonly accessor?: keyof T | ((item: T) => ReactNode)
  readonly cell?: (item: T, index: number) => ReactNode
  readonly align?: 'left' | 'center' | 'right'
  readonly width?: string | number
}

export interface DataTableProps<T> {
  readonly data: readonly T[]
  readonly columns: readonly ColumnDef<T>[]
  readonly keyExtractor: (item: T, index: number) => string | number
  readonly isLoading?: boolean
  readonly loadingRowCount?: number
  readonly error?: string | null
  readonly onRetry?: () => void
  readonly emptyTitle?: string
  readonly emptyDescription?: string
  readonly emptyAction?: ReactNode
  readonly onRowClick?: (item: T) => void
  readonly className?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  loadingRowCount = 5,
  error = null,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display right now.',
  emptyAction,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  if (error) {
    return (
      <ErrorState
        title="Failed to load data"
        description={error}
        onRetry={onRetry}
      />
    )
  }

  const renderCellContent = (column: ColumnDef<T>, item: T, index: number): ReactNode => {
    if (column.cell) {
      return column.cell(item, index)
    }

    if (typeof column.accessor === 'function') {
      return column.accessor(item)
    }

    if (column.accessor && typeof column.accessor === 'string' && column.accessor in (item as Record<string, unknown>)) {
      return String((item as Record<string, unknown>)[column.accessor])
    }

    return null
  }

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
      className={`hs-data-table-container ${className}`}
    >
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: 'var(--text-body-sm)',
          }}
          className="hs-data-table"
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--color-warm-white-subtle)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-caption)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: col.align || 'left',
                    width: col.width,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: loadingRowCount }).map((_, rIdx) => (
                <tr
                  key={`skeleton-row-${rIdx}`}
                  style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                >
                  {columns.map((col) => (
                    <td key={`skeleton-col-${col.id}`} style={{ padding: '14px 16px' }}>
                      <Skeleton height="18px" width="80%" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '32px 16px' }}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const rowKey = keyExtractor(item, index)
                const isClickable = Boolean(onRowClick)

                return (
                  <tr
                    key={rowKey}
                    onClick={isClickable ? () => onRowClick?.(item) : undefined}
                    style={{
                      borderBottom:
                        index === data.length - 1
                          ? 'none'
                          : '1px solid var(--color-border-subtle)',
                      backgroundColor: 'transparent',
                      cursor: isClickable ? 'pointer' : 'default',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    className={`hs-table-row ${isClickable ? 'hs-table-row-interactive' : ''}`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        style={{
                          padding: '14px 16px',
                          color: 'var(--color-text-primary)',
                          textAlign: col.align || 'left',
                          lineHeight: 1.5,
                        }}
                      >
                        {renderCellContent(col, item, index)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
