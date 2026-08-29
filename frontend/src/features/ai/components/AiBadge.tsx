import { Badge, type BadgeVariant } from '@/components/ui'
import { Sparkles } from 'lucide-react'

export interface AiBadgeProps {
  readonly label?: string
  readonly variant?: BadgeVariant
  readonly size?: 'sm' | 'md'
}

export function AiBadge({
  label = 'AI Generated',
  variant = 'accent',
  size = 'sm',
}: AiBadgeProps) {
  return (
    <Badge
      variant={variant}
      size={size}
      icon={<Sparkles size={size === 'sm' ? 12 : 14} style={{ marginRight: '2px' }} />}
    >
      {label}
    </Badge>
  )
}
