import { type ReactNode } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '../button'

export interface FilterBarProps {
  readonly children: ReactNode
  readonly activeCount?: number
  readonly onClearAll?: () => void
  readonly clearLabel?: string
  readonly extraActions?: ReactNode
  readonly className?: string
}

export function FilterBar({
  children,
  activeCount = 0,
  onClearAll,
  clearLabel = 'Clear Filters',
  extraActions,
  className = '',
}: FilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        padding: '12px 16px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        width: '100%',
        boxSizing: 'border-box',
      }}
      className={`hs-filter-bar ${className}`}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-body-sm)',
            fontWeight: 500,
            paddingRight: 'var(--space-2)',
            borderRight: '1px solid var(--color-border-subtle)',
          }}
          aria-hidden="true"
        >
          <Filter style={{ width: '16px', height: '16px' }} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-charcoal)',
                color: 'var(--color-white)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {activeCount}
            </span>
          )}
        </div>

        {children}

        {activeCount > 0 && onClearAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            iconLeft={<X style={{ width: '14px', height: '14px' }} />}
            style={{ color: 'var(--color-text-muted)' }}
          >
            {clearLabel}
          </Button>
        )}
      </div>

      {extraActions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {extraActions}
        </div>
      )}
    </div>
  )
}
