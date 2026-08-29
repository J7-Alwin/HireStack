import type { ComponentType } from 'react'
import { Card } from '@/components/ui'
import { formatNumber } from '../utils'

export interface KpiCardProps {
  readonly title: string
  readonly value?: number | string | null
  readonly icon?: ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  readonly detail?: string
  readonly isLoading?: boolean
  readonly iconBg?: string
  readonly iconColor?: string
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  detail,
  isLoading = false,
  iconBg = 'var(--color-warm-white-subtle)',
  iconColor = 'var(--color-charcoal)',
}: KpiCardProps) {
  const displayValue =
    typeof value === 'number' ? formatNumber(value) : (value ?? '—')

  return (
    <Card
      variant="elevated"
      padding="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '120px',
        boxSizing: 'border-box',
      }}
      className="hs-kpi-card"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-2)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-caption)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {title}
        </span>

        {Icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
            }}
            aria-hidden="true"
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div>
        {isLoading ? (
          <div
            data-testid="kpi-skeleton"
            style={{
              width: '80px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-warm-white-subtle)',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {displayValue}
          </div>
        )}

        {detail && (
          <p
            style={{
              fontSize: 'var(--text-caption)',
              color: 'var(--color-text-muted)',
              marginTop: '6px',
              margin: '6px 0 0 0',
            }}
          >
            {detail}
          </p>
        )}
      </div>
    </Card>
  )
}
