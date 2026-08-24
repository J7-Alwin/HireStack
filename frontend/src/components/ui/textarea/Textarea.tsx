import { type TextareaHTMLAttributes, forwardRef, useId } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label?: string
  readonly helperText?: string
  readonly error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    helperText,
    error,
    id: customId,
    disabled,
    required,
    className = '',
    style,
    rows = 4,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const textareaId = customId || generatedId
  const helperId = `${textareaId}-helper`
  const errorId = `${textareaId}-error`

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
          htmlFor={textareaId}
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

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={ariaDescribedBy}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 'var(--text-body-sm)',
          fontFamily: 'inherit',
          color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
          backgroundColor: disabled ? 'var(--color-background-subtle)' : 'var(--color-surface)',
          border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          lineHeight: 'var(--leading-normal)',
          ...style,
        }}
        className={`hs-textarea ${hasError ? 'hs-textarea-error' : ''} ${className}`}
        {...props}
      />

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
