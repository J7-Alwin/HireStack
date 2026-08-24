import { type HTMLAttributes, type ReactNode } from 'react'

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent' | 'charcoal'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly variant?: BadgeVariant
  readonly size?: BadgeSize
  readonly withDot?: boolean
  readonly icon?: ReactNode
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  withDot = false,
  icon,
  className = '',
  style,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string; dot: string }> = {
    neutral: {
      bg: 'var(--color-warm-white-subtle)',
      color: 'var(--color-text-secondary)',
      border: 'var(--color-border)',
      dot: 'var(--color-text-muted)',
    },
    success: {
      bg: 'var(--color-success-bg)',
      color: 'var(--color-success-text)',
      border: 'var(--color-success-border)',
      dot: 'var(--color-success)',
    },
    warning: {
      bg: 'var(--color-warning-bg)',
      color: 'var(--color-warning-text)',
      border: 'var(--color-warning-border)',
      dot: 'var(--color-warning)',
    },
    error: {
      bg: 'var(--color-error-bg)',
      color: 'var(--color-error-text)',
      border: 'var(--color-error-border)',
      dot: 'var(--color-error)',
    },
    info: {
      bg: 'var(--color-info-bg)',
      color: 'var(--color-info-text)',
      border: 'var(--color-info-border)',
      dot: 'var(--color-info)',
    },
    accent: {
      bg: 'var(--color-lime-subtle)',
      color: 'var(--color-charcoal)',
      border: 'rgba(227, 255, 122, 0.6)',
      dot: 'var(--color-charcoal)',
    },
    charcoal: {
      bg: 'var(--color-charcoal)',
      color: 'var(--color-white)',
      border: 'var(--color-charcoal)',
      dot: 'var(--color-lime)',
    },
  }

  const currentVariant = variantStyles[variant]

  const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
    sm: {
      padding: '2px 8px',
      fontSize: '11px',
      gap: '4px',
    },
    md: {
      padding: '3px 10px',
      fontSize: '12px',
      gap: '6px',
    },
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 500,
        borderRadius: 'var(--radius-pill)',
        border: `1px solid ${currentVariant.border}`,
        backgroundColor: currentVariant.bg,
        color: currentVariant.color,
        lineHeight: 1.4,
        letterSpacing: '0.01em',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
        ...style,
      }}
      className={`hs-badge hs-badge-${variant} hs-badge-${size} ${className}`}
      {...props}
    >
      {withDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: currentVariant.dot,
          }}
          aria-hidden="true"
        />
      )}
      {icon && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}
