import { Badge, type BadgeVariant } from '@/components/ui'
import { formatAtsStatusLabel, getAtsStatusVariant } from '@/utils/ats'

export interface AtsStatusBadgeProps {
  readonly status?: string | null
  readonly label?: string
  readonly variant?: BadgeVariant
  readonly size?: 'sm' | 'md'
  readonly withDot?: boolean
  readonly className?: string
}

export function AtsStatusBadge({
  status,
  label,
  variant,
  size = 'sm',
  withDot = true,
  className = '',
}: AtsStatusBadgeProps) {
  const displayLabel = label ?? formatAtsStatusLabel(status)
  const displayVariant = variant ?? getAtsStatusVariant(status)

  return (
    <Badge
      variant={displayVariant}
      size={size}
      withDot={withDot}
      className={`hs-ats-status-badge ${className}`}
    >
      {displayLabel}
    </Badge>
  )
}
