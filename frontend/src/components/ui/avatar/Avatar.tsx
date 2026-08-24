import { useState, type HTMLAttributes } from 'react'

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  readonly src?: string
  readonly name?: string
  readonly alt?: string
  readonly size?: AvatarSize
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({
  src,
  name,
  alt,
  size = 'md',
  className = '',
  style,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const sizePixels: Record<AvatarSize, number> = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  }

  const fontSizes: Record<AvatarSize, string> = {
    sm: '11px',
    md: '13px',
    lg: '16px',
    xl: '20px',
  }

  const px = sizePixels[size]
  const initials = getInitials(name)
  const accessibleLabel = alt || name || 'User avatar'
  const hasImage = Boolean(src && !imageError)

  return (
    <div
      role={hasImage ? undefined : 'img'}
      aria-label={hasImage ? undefined : accessibleLabel}
      style={{
        width: `${px}px`,
        height: `${px}px`,
        minWidth: `${px}px`,
        minHeight: `${px}px`,
        borderRadius: '50%',
        backgroundColor: 'var(--color-warm-white-subtle)',
        border: '1px solid var(--color-border)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        position: 'relative',
        ...style,
      }}
      className={`hs-avatar hs-avatar-${size} ${className}`}
      {...props}
    >
      {hasImage ? (
        <img
          src={src}
          alt={accessibleLabel}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <span
          style={{
            fontSize: fontSizes[size],
            fontWeight: 600,
            color: 'var(--color-charcoal)',
            letterSpacing: '0.02em',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}
