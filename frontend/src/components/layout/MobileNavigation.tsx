import { useEffect, useRef } from 'react'
import { useUiStore } from '@/stores'
import { SidebarNavigation } from './SidebarNavigation'
import { X } from 'lucide-react'

export function MobileNavigation() {
  const { isMobileNavOpen, setMobileNavOpen } = useUiStore()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMobileNavOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when mobile nav is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isMobileNavOpen, setMobileNavOpen])

  if (!isMobileNavOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
      }}
      className="hs-mobile-nav"
    >
      {/* Backdrop */}
      <div
        data-testid="mobile-nav-backdrop"
        onClick={() => setMobileNavOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 'var(--z-modal-backdrop)',
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'relative',
          width: '280px',
          maxWidth: '85vw',
          height: '100%',
          backgroundColor: 'var(--color-charcoal)',
          color: 'var(--color-text-inverse)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 'var(--z-modal)',
          boxShadow: 'var(--shadow-xl)',
          overflowY: 'auto',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
            padding: '0 16px',
            borderBottom: '1px solid var(--color-border-dark)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-charcoal-dark)',
                color: 'var(--color-lime)',
                fontWeight: 800,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              H
            </div>
            <span
              style={{
                fontSize: 'var(--text-h4)',
                fontWeight: 700,
                color: 'var(--color-white)',
              }}
            >
              HireStack
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation menu"
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
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, padding: '16px 12px' }}>
          <SidebarNavigation
            isCollapsed={false}
            onItemClick={() => setMobileNavOpen(false)}
          />
        </div>
      </div>
    </div>
  )
}
