import { type CSSProperties } from 'react'

export interface DecorativeDotProps {
  readonly size?: number | string
  readonly color?: string
  readonly style?: CSSProperties
  readonly className?: string
}

export function DecorativeDot({
  size = 8,
  color = 'var(--color-lime)',
  style,
  className = '',
}: DecorativeDotProps) {
  const px = typeof size === 'number' ? `${size}px` : size

  return (
    <span
      aria-hidden="true"
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'inline-block',
        pointerEvents: 'none',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
      className={`hs-decorative-dot ${className}`}
    />
  )
}
