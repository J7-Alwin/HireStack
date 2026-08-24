import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
  readonly isLoading?: boolean
  readonly iconLeft?: ReactNode
  readonly iconRight?: ReactNode
  readonly fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    iconLeft,
    iconRight,
    fullWidth = false,
    disabled,
    className = '',
    style,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading

  // Inline styling utilizing CSS tokens
  const baseStyle: React.CSSProperties = {
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 500,
    fontFamily: 'inherit',
    border: '1px solid transparent',
    borderRadius: size === 'sm' ? 'var(--radius-sm)' : size === 'lg' ? 'var(--radius-md)' : '10px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.55 : 1,
    transition: 'all var(--transition-fast)',
    textDecoration: 'none',
    boxSizing: 'border-box',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'relative',
    ...style,
  }

  // Size styles
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: 'var(--text-caption)', minHeight: '32px' },
    md: { padding: '9px 18px', fontSize: 'var(--text-body-sm)', minHeight: '40px' },
    lg: { padding: '12px 24px', fontSize: 'var(--text-body)', minHeight: '48px' },
  }

  // Variant styles
  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-charcoal)',
      color: 'var(--color-white)',
      borderColor: 'var(--color-charcoal)',
      boxShadow: 'var(--shadow-sm)',
    },
    accent: {
      backgroundColor: 'var(--color-lime)',
      color: 'var(--color-charcoal)',
      borderColor: 'var(--color-lime)',
      fontWeight: 600,
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      borderColor: 'var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      borderColor: 'var(--color-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-white)',
      borderColor: 'var(--color-error)',
    },
  }

  const combinedStyle: React.CSSProperties = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      style={combinedStyle}
      className={`hs-button hs-button-${variant} hs-button-${size} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2
          className="hs-button-spinner"
          style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}
          aria-hidden="true"
        />
      ) : (
        iconLeft
      )}
      <span>{children}</span>
      {!isLoading && iconRight}
    </button>
  )
})
