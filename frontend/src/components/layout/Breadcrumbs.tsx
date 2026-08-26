import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  readonly label: string
  readonly href?: string
}

export interface BreadcrumbsProps {
  readonly items?: readonly BreadcrumbItem[]
  readonly rootLabel?: string
  readonly rootHref?: string
}

function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function Breadcrumbs({
  items,
  rootLabel = 'Overview',
  rootHref = '/app',
}: BreadcrumbsProps) {
  const location = useLocation()

  // Derive items from URL pathname if not explicitly provided
  const derivedItems: BreadcrumbItem[] = (() => {
    if (items && items.length > 0) {
      return items as BreadcrumbItem[]
    }

    const segments = location.pathname.split('/').filter(Boolean)
    // If on /app or root, default to single item
    if (segments.length <= 1) {
      return [{ label: rootLabel }]
    }

    const result: BreadcrumbItem[] = [{ label: rootLabel, href: rootHref }]
    let cumulativePath = ''

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      cumulativePath += `/${segment}`

      // Skip the /app prefix as rootLabel handles it
      if (segment === 'app') continue

      const isLast = i === segments.length - 1
      result.push({
        label: formatSegment(segment),
        href: isLast ? undefined : cumulativePath,
      })
    }

    return result
  })()

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: 'var(--text-caption)',
        color: 'var(--color-text-muted)',
      }}
      className="hs-breadcrumbs"
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          flexWrap: 'wrap',
        }}
      >
        {derivedItems.map((item, index) => {
          const isLast = index === derivedItems.length - 1

          return (
            <li
              key={`${item.label}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {index > 0 && (
                <ChevronRight
                  size={12}
                  style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {index === 0 && <Home size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} aria-hidden="true" />}
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  to={item.href}
                  style={{
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    transition: 'color var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {index === 0 && <Home size={13} aria-hidden="true" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
