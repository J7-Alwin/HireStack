import { type ReactNode } from 'react'
import { FolderSearch } from 'lucide-react'

export interface EmptyStateProps {
  readonly title: string
  readonly description?: string
  readonly icon?: ReactNode
  readonly action?: ReactNode
  readonly className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        boxSizing: 'border-box',
        width: '100%',
      }}
      className={`hs-empty-state ${className}`}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-warm-white-subtle)',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
          border: '1px solid var(--color-border-subtle)',
        }}
        aria-hidden="true"
      >
        {icon || <FolderSearch style={{ width: '28px', height: '28px' }} />}
      </div>

      <h3
        style={{
          fontSize: 'var(--text-h3)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 6px 0',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-secondary)',
            maxWidth: '440px',
            margin: '0 0 var(--space-6) 0',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  )
}
