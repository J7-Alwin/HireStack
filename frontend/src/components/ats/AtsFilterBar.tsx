import type { ReactNode } from 'react'
import { Button } from '@/components/ui'
import { X } from 'lucide-react'

export interface AtsFilterBarProps {
  readonly children: ReactNode
  readonly onClear?: () => void
  readonly activeFiltersCount?: number
  readonly className?: string
}

export function AtsFilterBar({
  children,
  onClear,
  activeFiltersCount = 0,
  className = '',
}: AtsFilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
        width: '100%',
      }}
      className={`hs-ats-filter-bar ${className}`}
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
        {children}
      </div>

      {onClear && activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          iconLeft={<X size={14} />}
        >
          Reset Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  )
}
