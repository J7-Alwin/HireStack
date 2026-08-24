import { type SelectHTMLAttributes, forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label?: string
  readonly helperText?: string
  readonly error?: string
  readonly options?: readonly SelectOption[]
  readonly placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    helperText,
    error,
    options,
    placeholder,
    children,
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
  const selectId = customId || generatedId
  const helperId = `${selectId}-helper`
  const errorId = `${selectId}-error`

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
          htmlFor={selectId}
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

      <div style={{ position: 'relative', width: '100%' }}>
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={ariaDescribedBy}
          style={{
            width: '100%',
            minHeight: '40px',
            padding: '8px 36px 8px 12px',
            fontSize: 'var(--text-body-sm)',
            fontFamily: 'inherit',
            color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            backgroundColor: disabled ? 'var(--color-background-subtle)' : 'var(--color-surface)',
            border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxSizing: 'border-box',
            ...style,
          }}
          className={`hs-select ${hasError ? 'hs-select-error' : ''} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-text-muted)',
          }}
          aria-hidden="true"
        >
          <ChevronDown style={{ width: '16px', height: '16px' }} />
        </div>
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
