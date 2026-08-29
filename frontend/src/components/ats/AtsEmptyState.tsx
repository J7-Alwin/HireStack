import type { ReactNode } from 'react'
import { EmptyState } from '@/components/ui'

export interface AtsEmptyStateProps {
  readonly title: string
  readonly description?: string
  readonly icon?: ReactNode
  readonly action?: ReactNode
  readonly className?: string
}

export function AtsEmptyState({
  title,
  description = 'There are no records matching your current criteria.',
  icon,
  action,
  className = '',
}: AtsEmptyStateProps) {
  return (
    <div
      style={{
        padding: 'var(--space-8) var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
      className={`hs-ats-empty-state-wrapper ${className}`}
    >
      <EmptyState
        title={title}
        description={description}
        icon={icon}
        action={action}
      />
    </div>
  )
}
