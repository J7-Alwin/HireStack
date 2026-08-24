import { type CSSProperties } from 'react'

export interface DecorativeCurveProps {
  readonly width?: number | string
  readonly height?: number | string
  readonly color?: string
  readonly strokeWidth?: number
  readonly style?: CSSProperties
  readonly className?: string
}

export function DecorativeCurve({
  width = 120,
  height = 40,
  color = 'var(--color-lime)',
  strokeWidth = 1.5,
  style,
  className = '',
}: DecorativeCurveProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ pointerEvents: 'none', userSelect: 'none', ...style }}
      className={`hs-decorative-curve ${className}`}
    >
      <path
        d="M2 38C30 10 90 10 118 38"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}
