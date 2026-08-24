import { type CSSProperties } from 'react'

export interface DecorativeCircleProps {
  readonly size?: number | string
  readonly color?: string
  readonly borderStyle?: 'solid' | 'dashed'
  readonly style?: CSSProperties
  readonly className?: string
}

export function DecorativeCircle({
  size = 48,
  color = 'var(--color-border)',
  borderStyle = 'solid',
  style,
  className = '',
}: DecorativeCircleProps) {
  const px = typeof size === 'number' ? `${size}px` : size

  return (
    <div
      aria-hidden="true"
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        border: `1.5px ${borderStyle} ${color}`,
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'inline-block',
        ...style,
      }}
      className={`hs-decorative-circle ${className}`}
    />
  )
}
