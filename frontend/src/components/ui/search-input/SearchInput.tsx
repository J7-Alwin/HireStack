import { type ChangeEvent, forwardRef, useId } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

export interface SearchInputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly label?: string
  readonly isLoading?: boolean
  readonly onClear?: () => void
  readonly disabled?: boolean
  readonly className?: string
  readonly autoFocus?: boolean
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value,
    onChange,
    placeholder = 'Search...',
    label,
    isLoading = false,
    onClear,
    disabled = false,
    className = '',
    autoFocus = false,
  },
  ref
) {
  const generatedId = useId()
  const inputId = generatedId

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--text-body-sm)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
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
        <div
          style={{
            position: 'absolute',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <Search style={{ width: '16px', height: '16px' }} />
        </div>

        <input
          ref={ref}
          id={inputId}
          type="search"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={label || placeholder}
          style={{
            width: '100%',
            minHeight: '38px',
            padding: '8px 36px 8px 36px',
            fontSize: 'var(--text-body-sm)',
            fontFamily: 'inherit',
            color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            backgroundColor: disabled ? 'var(--color-background-subtle)' : 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          className={`hs-search-input ${className}`}
        />

        <div
          style={{
            position: 'absolute',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isLoading ? (
            <Loader2
              style={{
                width: '16px',
                height: '16px',
                color: 'var(--color-text-muted)',
                animation: 'spin 1s linear infinite',
              }}
              aria-label="Searching"
            />
          ) : value && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                padding: 0,
                border: 'none',
                background: 'var(--color-warm-white-subtle)',
                color: 'var(--color-text-secondary)',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '12px', height: '12px' }} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
})
