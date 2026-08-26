import { useUiStore } from '@/stores'
import { Breadcrumbs } from './Breadcrumbs'
import { CompanyContext } from './CompanyContext'
import { UserMenu } from './UserMenu'
import { Menu, Search, Bell } from 'lucide-react'

export function Topbar() {
  const { toggleMobileNav } = useUiStore()

  return (
    <header
      aria-label="Application Header"
      style={{
        height: '64px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        boxSizing: 'border-box',
      }}
      className="hs-topbar"
    >
      {/* Left Area: Mobile Menu Trigger + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={toggleMobileNav}
          aria-label="Open navigation menu"
          className="hs-mobile-menu-trigger"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <Breadcrumbs />
      </div>

      {/* Right Area: Context, Search Foundation, Notifications Foundation, User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CompanyContext />

        {/* Global Search Trigger Foundation */}
        <button
          type="button"
          aria-label="Global search"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'var(--color-warm-white-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-caption)',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast)',
          }}
          onClick={() => {
            // Global search modal foundation hook
          }}
        >
          <Search size={14} aria-hidden="true" />
          <span className="hs-search-placeholder">Quick search...</span>
          <kbd
            style={{
              padding: '1px 5px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Notifications Trigger Foundation */}
        <button
          type="button"
          aria-label="Notifications"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '50%',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
          onClick={() => {
            // Notifications drawer/panel foundation hook
          }}
        >
          <Bell size={16} aria-hidden="true" />
          {/* Subtle unread indicator foundation */}
          <span
            style={{
              position: 'absolute',
              top: '7px',
              right: '7px',
              width: '7px',
              height: '7px',
              backgroundColor: 'var(--color-lime-dark)',
              borderRadius: '50%',
            }}
            aria-hidden="true"
          />
        </button>

        <UserMenu />
      </div>
    </header>
  )
}
