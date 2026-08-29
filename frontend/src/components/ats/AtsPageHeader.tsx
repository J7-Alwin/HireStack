import type { ReactNode } from 'react'

export interface AtsPageHeaderProps {
  readonly title: string
  readonly subtitle?: string
  readonly badge?: ReactNode
  readonly primaryAction?: ReactNode
  readonly secondaryActions?: ReactNode
  readonly className?: string
}

export function AtsPageHeader({
  title,
  subtitle,
  badge,
  primaryAction,
  secondaryActions,
  className = '',
}: AtsPageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}
      className={`hs-ats-page-header ${className}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          {badge}
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
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
        }}
      >
        {secondaryActions}
        {primaryAction}
      </div>
    </div>
  )
}
