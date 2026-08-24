import { type ButtonHTMLAttributes, forwardRef, useId } from 'react'

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'role' | 'aria-checked'> {
  readonly checked?: boolean
  readonly onCheckedChange?: (checked: boolean) => void
  readonly label?: string
  readonly helperText?: string
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked = false,
    onCheckedChange,
    label,
    helperText,
    disabled = false,
    id: customId,
    className = '',
    style,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const switchId = customId || generatedId
  const helperId = `${switchId}-helper`

  const handleToggle = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '10px' }}>
      <button
        ref={ref}
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={helperText ? helperId : undefined}
        disabled={disabled}
        onClick={handleToggle}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          width: '42px',
          height: '24px',
          padding: '2px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid transparent',
          backgroundColor: checked ? 'var(--color-charcoal)' : 'var(--color-soft-gray)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'background-color var(--transition-fast)',
          outline: 'none',
          boxSizing: 'border-box',
          ...style,
        }}
        className={`hs-switch ${checked ? 'hs-switch-checked' : ''} ${className}`}
        {...props}
      >
        <span
          style={{
            display: 'inline-block',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: checked ? 'var(--color-lime)' : 'var(--color-white)',
            boxShadow: 'var(--shadow-sm)',
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
            transition: 'transform var(--transition-fast), background-color var(--transition-fast)',
          }}
          aria-hidden="true"
        />
      </button>

      {label && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label
            htmlFor={switchId}
            style={{
              fontSize: 'var(--text-body-sm)',
              fontWeight: 500,
              color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              lineHeight: 1.4,
            }}
          >
            {label}
          </label>
          {helperText && (
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
        </div>
      )}
    </div>
  )
})
