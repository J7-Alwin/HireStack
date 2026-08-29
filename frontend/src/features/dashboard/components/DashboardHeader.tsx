import type { ReactNode } from 'react'

export interface DashboardHeaderProps {
  readonly title: string
  readonly subtitle?: string
  readonly badge?: ReactNode
  readonly action?: ReactNode
}

export function DashboardHeader({
  title,
  subtitle,
  badge,
  action,
}: DashboardHeaderProps) {
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
      className="hs-dashboard-header"
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

      {action && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {action}
        </div>
      )}
    </div>
  )
}
