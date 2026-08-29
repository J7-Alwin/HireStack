import type { ReactNode } from 'react'
import { Button } from '@/components/ui'
import { AtsStatusBadge } from './AtsStatusBadge'
import { ArrowLeft } from 'lucide-react'

export interface AtsDetailHeaderProps {
  readonly title: string
  readonly subtitle?: string
  readonly status?: string | null
  readonly tags?: readonly ReactNode[]
  readonly backLabel?: string
  readonly onBack?: () => void
  readonly actions?: ReactNode
  readonly className?: string
}

export function AtsDetailHeader({
  title,
  subtitle,
  status,
  tags = [],
  backLabel = 'Back',
  onBack,
  actions,
  className = '',
}: AtsDetailHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}
      className={`hs-ats-detail-header ${className}`}
    >
      {onBack && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            iconLeft={<ArrowLeft size={14} />}
          >
            {backLabel}
          </Button>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: 'var(--tracking-tight)',
                margin: 0,
              }}
            >
              {title}
            </h1>
            {status && <AtsStatusBadge status={status} size="md" />}
          </div>

          {subtitle && (
            <p
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}

          {tags.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '4px',
              }}
            >
              {tags}
            </div>
          )}
        </div>

        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
