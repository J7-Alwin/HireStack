import { type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

export type AlertVariant = 'success' | 'warning' | 'error' | 'info'

export interface AlertProps {
  readonly variant?: AlertVariant
  readonly title?: string
  readonly children: ReactNode
  readonly icon?: ReactNode
  readonly onClose?: () => void
  readonly className?: string
}

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  onClose,
  className = '',
}: AlertProps) {
  const variantIcons: Record<AlertVariant, ReactNode> = {
    success: <CheckCircle2 style={{ width: '18px', height: '18px', color: 'var(--color-success)' }} />,
    warning: <AlertTriangle style={{ width: '18px', height: '18px', color: 'var(--color-warning)' }} />,
    error: <AlertCircle style={{ width: '18px', height: '18px', color: 'var(--color-error)' }} />,
    info: <Info style={{ width: '18px', height: '18px', color: 'var(--color-info)' }} />,
  }

  const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string }> = {
    success: {
      bg: 'var(--color-success-bg)',
      border: 'var(--color-success-border)',
      text: 'var(--color-success-text)',
    },
    warning: {
      bg: 'var(--color-warning-bg)',
      border: 'var(--color-warning-border)',
      text: 'var(--color-warning-text)',
    },
    error: {
      bg: 'var(--color-error-bg)',
      border: 'var(--color-error-border)',
      text: 'var(--color-error-text)',
    },
    info: {
      bg: 'var(--color-info-bg)',
      border: 'var(--color-info-border)',
      text: 'var(--color-info-text)',
    },
  }

  const currentStyles = variantStyles[variant]
  const displayIcon = icon !== undefined ? icon : variantIcons[variant]

  return (
    <div
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        backgroundColor: currentStyles.bg,
        border: `1px solid ${currentStyles.border}`,
        borderRadius: 'var(--radius-md)',
        color: currentStyles.text,
        boxSizing: 'border-box',
        width: '100%',
      }}
      className={`hs-alert hs-alert-${variant} ${className}`}
    >
      {displayIcon && (
        <div style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden="true">
          {displayIcon}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {title && (
          <h4
            style={{
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              color: currentStyles.text,
              margin: 0,
            }}
          >
            {title}
          </h4>
        )}
        <div style={{ fontSize: 'var(--text-body-sm)', lineHeight: 1.5 }}>
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            background: 'transparent',
            border: 'none',
            color: currentStyles.text,
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            opacity: 0.8,
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>
      )}
    </div>
  )
}
