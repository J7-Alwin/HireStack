import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string
  readonly helperText?: string
  readonly error?: string
  readonly iconLeft?: ReactNode
  readonly iconRight?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    iconLeft,
    iconRight,
    id: customId,
    disabled,
    required,
    className = '',
    style,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = customId || generatedId
  const helperId = `${inputId}-helper`
  const errorId = `${inputId}-error`

  const hasError = Boolean(error)
  const ariaDescribedBy = [
    hasError ? errorId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--text-body-sm)',
            fontWeight: 500,
            color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--color-error)' }} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {iconLeft && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'var(--color-text-muted)',
            }}
            aria-hidden="true"
          >
            {iconLeft}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={ariaDescribedBy}
          style={{
            width: '100%',
            minHeight: '40px',
            padding: `8px ${iconRight ? '36px' : '12px'} 8px ${iconLeft ? '36px' : '12px'}`,
            fontSize: 'var(--text-body-sm)',
            fontFamily: 'inherit',
            color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            backgroundColor: disabled ? 'var(--color-background-subtle)' : 'var(--color-surface)',
            border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            outline: 'none',
            boxSizing: 'border-box',
            ...style,
          }}
          className={`hs-input ${hasError ? 'hs-input-error' : ''} ${className}`}
          {...props}
        />

        {iconRight && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            {iconRight}
          </div>
        )}
      </div>

      {hasError && (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: 0,
            fontSize: 'var(--text-caption)',
            color: 'var(--color-error)',
            fontWeight: 500,
          }}
        >
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p
          id={helperId}
          style={{
            margin: 0,
            fontSize: 'var(--text-caption)',
            color: 'var(--color-text-muted)',
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  )
})
