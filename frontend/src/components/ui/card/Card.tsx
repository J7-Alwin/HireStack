import { type HTMLAttributes, forwardRef } from 'react'

export type CardVariant = 'default' | 'elevated' | 'dark' | 'accent' | 'subtle'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: CardVariant
  readonly padding?: CardPadding
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'default',
    padding = 'md',
    children,
    className = '',
    style,
    ...props
  },
  ref
) {
  const paddingStyles: Record<CardPadding, string> = {
    none: '0',
    sm: 'var(--space-3)',
    md: 'var(--space-6)',
    lg: 'var(--space-8)',
  }

  const variantStyles: Record<CardVariant, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    },
    elevated: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border-subtle)',
      boxShadow: 'var(--shadow-md)',
    },
    dark: {
      backgroundColor: 'var(--color-charcoal)',
      color: 'var(--color-text-inverse)',
      border: '1px solid var(--color-border-dark)',
      boxShadow: 'var(--shadow-lg)',
    },
    accent: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      border: '1.5px solid var(--color-lime)',
      boxShadow: 'var(--shadow-md)',
    },
    subtle: {
      backgroundColor: 'var(--color-warm-white-subtle)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
    },
  }

  return (
    <div
      ref={ref}
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: paddingStyles[padding],
        transition: 'all var(--transition-fast)',
        boxSizing: 'border-box',
        ...variantStyles[variant],
        ...style,
      }}
      className={`hs-card hs-card-${variant} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})

export function CardHeader({
  children,
  className = '',
  style,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: 'var(--space-4)',
        ...style,
      }}
      className={`hs-card-header ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className = '',
  style,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      style={{
        fontSize: 'var(--text-h3)',
        fontWeight: 600,
        letterSpacing: 'var(--tracking-tight)',
        ...style,
      }}
      className={`hs-card-title ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  children,
  className = '',
  style,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      style={{
        fontSize: 'var(--text-body-sm)',
        color: 'var(--color-text-secondary)',
        margin: 0,
        ...style,
      }}
      className={`hs-card-description ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({
  children,
  className = '',
  style,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{ ...style }}
      className={`hs-card-content ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({
  children,
  className = '',
  style,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-6)',
        paddingTop: 'var(--space-4)',
        borderTop: '1px solid var(--color-border-subtle)',
        ...style,
      }}
      className={`hs-card-footer ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
