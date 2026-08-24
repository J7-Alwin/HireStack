import { useState, useRef, useEffect, type ReactNode } from 'react'

export interface DropdownItem {
  readonly id: string
  readonly label: string
  readonly icon?: ReactNode
  readonly onClick?: () => void
  readonly disabled?: boolean
  readonly isDanger?: boolean
  readonly isDivider?: boolean
}

export interface DropdownProps {
  readonly trigger: ReactNode
  readonly items: readonly DropdownItem[]
  readonly align?: 'left' | 'right'
}

export function Dropdown({ trigger, items, align = 'left' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const actionableItems = items.filter((item) => !item.isDivider && !item.disabled)

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(true)
        setFocusedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => (prev + 1) % actionableItems.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => (prev - 1 + actionableItems.length) % actionableItems.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < actionableItems.length) {
          const selected = actionableItems[focusedIndex]
          selected.onClick?.()
          setIsOpen(false)
        }
        break
    }
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      style={{ position: 'relative', display: 'inline-block' }}
      className="hs-dropdown"
    >
      <div
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'inline-flex' }}
        className="hs-dropdown-trigger"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align === 'right' ? 'right' : 'left']: 0,
            zIndex: 'var(--z-dropdown)',
            minWidth: '200px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
          className="hs-dropdown-menu"
        >
          {items.map((item) => {
            if (item.isDivider) {
              return (
                <div
                  key={item.id}
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--color-border-subtle)',
                    margin: '4px 0',
                  }}
                  role="separator"
                />
              )
            }

            const itemIndex = actionableItems.findIndex((a) => a.id === item.id)
            const isFocused = itemIndex === focusedIndex

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.()
                    setIsOpen(false)
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 500,
                  color: item.disabled
                    ? 'var(--color-text-muted)'
                    : item.isDanger
                      ? 'var(--color-error)'
                      : 'var(--color-text-primary)',
                  backgroundColor: isFocused ? 'var(--color-warm-white-subtle)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                {item.icon && (
                  <span style={{ display: 'flex', alignItems: 'center' }} aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
