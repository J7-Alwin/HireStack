import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

export type SortDirection = 'asc' | 'desc' | null

export interface SortControlProps {
  readonly label: string
  readonly direction: SortDirection
  readonly onToggle: () => void
  readonly disabled?: boolean
}

export function SortControl({
  label,
  direction,
  onToggle,
  disabled = false,
}: SortControlProps) {
  const getSortIcon = () => {
    if (direction === 'asc') {
      return <ArrowUp style={{ width: '14px', height: '14px', color: 'var(--color-charcoal)' }} />
    }
    if (direction === 'desc') {
      return <ArrowDown style={{ width: '14px', height: '14px', color: 'var(--color-charcoal)' }} />
    }
    return <ArrowUpDown style={{ width: '14px', height: '14px', color: 'var(--color-text-muted)' }} />
  }

  const ariaSortValue = direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={`Sort by ${label}, currently ${ariaSortValue}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'transparent',
        border: 'none',
        padding: '4px 6px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--text-caption)',
        fontWeight: direction ? 600 : 500,
        color: direction ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color var(--transition-fast)',
      }}
      className="hs-sort-control"
    >
      <span>{label}</span>
      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
        {getSortIcon()}
      </span>
    </button>
  )
}
