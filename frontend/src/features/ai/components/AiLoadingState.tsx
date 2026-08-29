import { Spinner, Skeleton } from '@/components/ui'
import { Sparkles } from 'lucide-react'

export interface AiLoadingStateProps {
  readonly title?: string
  readonly description?: string
  readonly variant?: 'spinner' | 'skeleton'
}

export function AiLoadingState({
  title = 'AI is evaluating...',
  description = 'Generating model evaluation. This may take several seconds.',
  variant = 'spinner',
}: AiLoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div
        data-testid="ai-loading-skeleton"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
            {title}
          </span>
        </div>
        <Skeleton height="24px" width="60%" />
        <Skeleton height="80px" />
        <Skeleton height="60px" />
      </div>
    )
  }

  return (
    <div
      data-testid="ai-loading-spinner"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-4)',
        textAlign: 'center',
        gap: 'var(--space-3)',
      }}
    >
      <Spinner size="lg" />
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
          }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
