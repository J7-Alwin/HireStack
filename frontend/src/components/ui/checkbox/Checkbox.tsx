import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import { Check } from 'lucide-react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  readonly label?: string
  readonly helperText?: string
  readonly error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    helperText,
    error,
    id: customId,
    checked,
    disabled = false,
    className = '',
    style,
    onChange,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const checkboxId = customId || generatedId
  const helperId = `${checkboxId}-helper`
  const errorId = `${checkboxId}-error`

  const hasError = Boolean(error)
  const isChecked = Boolean(checked)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    onChange?.(e)
  }

  const handleLabelClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault()
    }
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <label
        htmlFor={checkboxId}
        onClick={handleLabelClick}
        style={{
          display: 'inline-flex',
          alignItems: 'flex-start',
          gap: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        className={`hs-checkbox-label ${className}`}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '2px' }}>
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '18px',
              height: '18px',
              margin: 0,
              cursor: disabled ? 'not-allowed' : 'pointer',
              zIndex: 1,
            }}
            {...props}
          />
          <div
            className="hs-checkbox-box"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              border: `1.5px solid ${
                hasError
                  ? 'var(--color-error)'
                  : isChecked
                    ? 'var(--color-charcoal)'
                    : 'var(--color-border)'
              }`,
              backgroundColor: isChecked ? 'var(--color-lime)' : 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isChecked && (
              <Check
                style={{
                  width: '13px',
                  height: '13px',
                  color: 'var(--color-charcoal)',
                  strokeWidth: 3,
                }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {label && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: 'var(--text-body-sm)',
                fontWeight: 500,
                color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                lineHeight: 1.4,
              }}
            >
              {label}
            </span>
            {helperText && !hasError && (
              <span
                id={helperId}
                style={{
                  fontSize: 'var(--text-caption)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {helperText}
              </span>
            )}
            {hasError && (
              <span
                id={errorId}
                role="alert"
                style={{
                  fontSize: 'var(--text-caption)',
                  color: 'var(--color-error)',
                  fontWeight: 500,
                }}
              >
                {error}
              </span>
            )}
          </div>
        )}
      </label>
    </div>
  )
})
