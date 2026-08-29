import { Button } from '@/components/ui'
import { AlertCircle, RefreshCw } from 'lucide-react'

export interface AiErrorStateProps {
  readonly title?: string
  readonly error?: Error | string | null
  readonly onRetry?: () => void
}

export function AiErrorState({
  title = 'AI Evaluation Unavailable',
  error,
  onRetry,
}: AiErrorStateProps) {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.message || 'An error occurred during AI processing. Please check connection and try again.'

  return (
    <div
      data-testid="ai-error-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6) var(--space-4)',
        textAlign: 'center',
        backgroundColor: 'var(--color-surface-hover)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-error-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-error)',
        }}
      >
        <AlertCircle size={20} />
      </div>

      <div>
        <h4
          style={{
            margin: '0 0 4px 0',
            fontSize: 'var(--text-body-md)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-secondary)',
            maxWidth: '480px',
          }}
        >
          {errorMessage}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          iconLeft={<RefreshCw size={14} />}
        >
          Retry Evaluation
        </Button>
      )}
    </div>
  )
}
