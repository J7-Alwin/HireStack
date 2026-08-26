import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/features/auth'
import { Avatar, Badge } from '@/components/ui'
import { Role } from '@/types'
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react'

function getRoleLabel(role: Role): string {
  switch (role) {
    case Role.SUPER_ADMIN:
      return 'Super Admin'
    case Role.COMPANY_ADMIN:
      return 'Company Admin'
    case Role.RECRUITER:
      return 'Recruiter'
    case Role.CANDIDATE:
      return 'Candidate'
    default:
      return role
  }
}

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!user) return null

  const roleLabel = getRoleLabel(user.role)
  const userInitials = user.email.slice(0, 2).toUpperCase()

  return (
    <div
      ref={menuRef}
      style={{ position: 'relative', display: 'inline-block' }}
      className="hs-user-menu"
    >
      <button
        type="button"
        id="user-menu-button"
        aria-label="User account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px 4px 4px',
          backgroundColor: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          transition: 'background-color var(--transition-fast)',
        }}
      >
        <Avatar name={userInitials} size="sm" />
        <span
          style={{
            fontSize: 'var(--text-caption)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.email}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-labelledby="user-menu-button"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 'var(--z-dropdown)',
            width: '240px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {/* User Info Header */}
          <div
            style={{
              padding: '8px 10px',
              borderBottom: '1px solid var(--color-border-subtle)',
              marginBottom: '4px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </p>
            <div style={{ marginTop: '6px' }}>
              <Badge variant="accent" size="sm">
                {roleLabel}
              </Badge>
            </div>
          </div>

          {/* Account/Profile link foundation */}
          <button
            type="button"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 10px',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <UserIcon size={16} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
            <span>Account Details</span>
          </button>

          {/* Logout Action */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false)
              void logout()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 10px',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 500,
              color: 'var(--color-error)',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}
