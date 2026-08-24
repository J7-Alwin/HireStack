import { type ReactNode } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '../button'

export interface ErrorStateProps {
  readonly title?: string
  readonly description?: string
  readonly onRetry?: () => void
  readonly retryLabel?: string
  readonly icon?: ReactNode
  readonly className?: string
}

export function ErrorState({
  title = 'Failed to load content',
  description = 'An error occurred while fetching the requested data. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  icon,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-error-border)',
        backgroundColor: 'var(--color-surface)',
        boxSizing: 'border-box',
        width: '100%',
      }}
      className={`hs-error-state ${className}`}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
          border: '1px solid var(--color-error-border)',
        }}
        aria-hidden="true"
      >
        {icon || <AlertCircle style={{ width: '28px', height: '28px' }} />}
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

      <p
        style={{
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-text-secondary)',
          maxWidth: '440px',
          margin: onRetry ? '0 0 var(--space-6) 0' : 0,
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="md"
          onClick={onRetry}
          iconLeft={<RotateCcw style={{ width: '16px', height: '16px' }} />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
