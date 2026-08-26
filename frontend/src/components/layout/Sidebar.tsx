import { useUiStore } from '@/stores'
import { SidebarNavigation } from './SidebarNavigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useUiStore()

  const sidebarWidth = isSidebarCollapsed ? '72px' : '260px'

  return (
    <aside
      aria-label="Sidebar"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        backgroundColor: 'var(--color-charcoal)',
        color: 'var(--color-text-inverse)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--color-border-dark)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        transition: 'width var(--transition-normal), min-width var(--transition-normal)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      className="hs-sidebar"
    >
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          height: '64px',
          padding: isSidebarCollapsed ? '0' : '0 16px',
          borderBottom: '1px solid var(--color-border-dark)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-charcoal-dark)',
              border: '1px solid var(--color-border-dark)',
              color: 'var(--color-lime)',
              fontWeight: 800,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            H
          </div>

          {!isSidebarCollapsed && (
            <span
              style={{
                fontSize: 'var(--text-h4)',
                fontWeight: 700,
                color: 'var(--color-white)',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              HireStack
            </span>
          )}
        </div>

        {!isSidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            aria-expanded={true}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-inverse-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              transition: 'color var(--transition-fast)',
            }}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isSidebarCollapsed ? '16px 8px' : '16px 12px',
        }}
      >
        <SidebarNavigation isCollapsed={isSidebarCollapsed} />
      </div>

      {/* Bottom Controls / Expand Toggle when collapsed */}
      {isSidebarCollapsed && (
        <div
          style={{
            padding: '12px 0',
            display: 'flex',
            justifyContent: 'center',
            borderTop: '1px solid var(--color-border-dark)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            aria-expanded={false}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-inverse-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'color var(--transition-fast)',
            }}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </aside>
  )
}
