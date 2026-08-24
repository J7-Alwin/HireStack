import { type CSSProperties } from 'react'

export interface DecorativeSparkProps {
  readonly size?: number | string
  readonly color?: string
  readonly style?: CSSProperties
  readonly className?: string
}

export function DecorativeSpark({
  size = 24,
  color = 'var(--color-lime)',
  style,
  className = '',
}: DecorativeSparkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ pointerEvents: 'none', userSelect: 'none', ...style }}
      className={`hs-decorative-spark ${className}`}
    >
      <path
        d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z"
        fill={color}
      />
    </svg>
  )
}
