import { useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { getNavigationForUser, type NavigationItem } from '@/config/navigation.config'
import { Tooltip, Badge } from '@/components/ui'

export interface SidebarNavigationProps {
  readonly isCollapsed?: boolean
  readonly onItemClick?: () => void
}

export function SidebarNavigation({
  isCollapsed = false,
  onItemClick,
}: SidebarNavigationProps) {
  const { user } = useAuth()
  const location = useLocation()

  const sections = getNavigationForUser(user)

  const renderNavItem = (item: NavigationItem) => {
    const isExactMatch = location.pathname === item.path
    const isChildMatch =
      item.path !== '/app' && location.pathname.startsWith(item.path)
    const isActive = isExactMatch || isChildMatch

    const Icon = item.icon
    const isDisabled = item.enabled === false

    const itemContent = (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: isCollapsed ? '10px 0' : '9px 12px',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: isActive ? 600 : 500,
          color: isDisabled
            ? 'var(--color-text-inverse-muted)'
            : isActive
              ? 'var(--color-white)'
              : 'var(--color-text-inverse-secondary)',
          backgroundColor: isActive
            ? 'rgba(227, 255, 122, 0.12)'
            : 'transparent',
          borderLeft: isActive && !isCollapsed
            ? '3px solid var(--color-lime)'
            : '3px solid transparent',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-fast)',
          opacity: isDisabled ? 0.45 : 1,
        }}
      >
        <Icon
          size={18}
          style={{
            color: isActive ? 'var(--color-lime)' : 'inherit',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />

        {!isCollapsed && (
          <span
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </span>
        )}

        {!isCollapsed && item.badge && (
          <Badge variant="neutral" size="sm">
            {item.badge}
          </Badge>
        )}
      </div>
    )

    if (isDisabled) {
      if (isCollapsed) {
        return (
          <Tooltip key={item.id} content={`${item.label} (Coming Soon)`} position="right">
            <div>{itemContent}</div>
          </Tooltip>
        )
      }
      return <div key={item.id}>{itemContent}</div>
    }

    const navLink = (
      <NavLink
        key={item.id}
        to={item.path}
        onClick={onItemClick}
        aria-current={isActive ? 'page' : undefined}
        style={{
          textDecoration: 'none',
          display: 'block',
          width: '100%',
        }}
      >
        {itemContent}
      </NavLink>
    )

    if (isCollapsed) {
      return (
        <Tooltip key={item.id} content={item.label} position="right">
          {navLink}
        </Tooltip>
      )
    }

    return navLink
  }

  return (
    <nav
      aria-label="Main Navigation"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
      }}
      className="hs-sidebar-navigation"
    >
      {sections.map((section) => (
        <div
          key={section.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            width: '100%',
          }}
        >
          {!isCollapsed && (
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text-inverse-muted)',
                padding: '4px 12px',
                marginBottom: '2px',
              }}
            >
              {section.title}
            </div>
          )}

          {section.items.map(renderNavItem)}
        </div>
      ))}
    </nav>
  )
}
