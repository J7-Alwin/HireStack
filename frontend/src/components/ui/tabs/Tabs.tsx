import { useState, useRef, type ReactNode, useId } from 'react'

export interface TabItem {
  readonly id: string
  readonly label: string
  readonly content: ReactNode
  readonly icon?: ReactNode
  readonly badge?: ReactNode
  readonly disabled?: boolean
}

export interface TabsProps {
  readonly items: readonly TabItem[]
  readonly defaultTabId?: string
  readonly activeTabId?: string
  readonly onChange?: (tabId: string) => void
  readonly variant?: 'line' | 'pills'
}

export function Tabs({
  items,
  defaultTabId,
  activeTabId: controlledActiveId,
  onChange,
  variant = 'line',
}: TabsProps) {
  const [internalActiveId, setInternalActiveId] = useState<string>(
    defaultTabId || items[0]?.id || ''
  )
  const baseId = useId()
  const tabListRef = useRef<HTMLDivElement>(null)

  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId

  const handleSelectTab = (id: string) => {
    if (controlledActiveId === undefined) {
      setInternalActiveId(id)
    }
    onChange?.(id)
  }

  const enabledTabs = items.filter((item) => !item.disabled)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = enabledTabs.findIndex((item) => item.id === activeId)
    if (currentIndex === -1) return

    let nextIndex = -1

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextIndex = (currentIndex + 1) % enabledTabs.length
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = enabledTabs.length - 1
    }

    if (nextIndex !== -1) {
      const nextTab = enabledTabs[nextIndex]
      handleSelectTab(nextTab.id)
      const tabElement = tabListRef.current?.querySelector<HTMLButtonElement>(
        `#${baseId}-tab-${nextTab.id}`
      )
      tabElement?.focus()
    }
  }

  const activeItem = items.find((item) => item.id === activeId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        onKeyDown={handleKeyDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: variant === 'pills' ? '6px' : '24px',
          borderBottom: variant === 'line' ? '1px solid var(--color-border)' : 'none',
          backgroundColor: variant === 'pills' ? 'var(--color-warm-white-subtle)' : 'transparent',
          padding: variant === 'pills' ? '4px' : '0',
          borderRadius: variant === 'pills' ? 'var(--radius-md)' : '0',
          width: variant === 'pills' ? 'fit-content' : '100%',
        }}
        className={`hs-tabs-list hs-tabs-${variant}`}
      >
        {items.map((tab) => {
          const isSelected = tab.id === activeId
          const tabId = `${baseId}-tab-${tab.id}`
          const panelId = `${baseId}-panel-${tab.id}`

          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleSelectTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: variant === 'line' ? '12px 4px' : '8px 16px',
                fontSize: 'var(--text-body-sm)',
                fontWeight: isSelected ? 600 : 500,
                color: tab.disabled
                  ? 'var(--color-text-muted)'
                  : isSelected
                    ? 'var(--color-charcoal)'
                    : 'var(--color-text-secondary)',
                backgroundColor:
                  variant === 'pills' && isSelected ? 'var(--color-surface)' : 'transparent',
                border: 'none',
                borderBottom:
                  variant === 'line'
                    ? `2px solid ${isSelected ? 'var(--color-charcoal)' : 'transparent'}`
                    : 'none',
                borderRadius: variant === 'pills' ? 'var(--radius-sm)' : '0',
                boxShadow:
                  variant === 'pills' && isSelected ? 'var(--shadow-sm)' : 'none',
                marginBottom: variant === 'line' ? '-1px' : '0',
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              className={`hs-tab ${isSelected ? 'hs-tab-active' : ''}`}
            >
              {tab.icon && (
                <span style={{ display: 'flex', alignItems: 'center' }} aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge && <span>{tab.badge}</span>}
            </button>
          )
        })}
      </div>

      {/* Tab Panel */}
      {activeItem && (
        <div
          id={`${baseId}-panel-${activeItem.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          tabIndex={0}
          style={{
            paddingTop: 'var(--space-6)',
            outline: 'none',
          }}
          className="hs-tab-panel"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  )
}
