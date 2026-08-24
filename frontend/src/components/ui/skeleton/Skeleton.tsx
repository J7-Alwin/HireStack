import { type HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  readonly width?: string | number
  readonly height?: string | number
  readonly borderRadius?: string | number
  readonly circle?: boolean
}

export function Skeleton({
  width,
  height,
  borderRadius,
  circle = false,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const computedBorderRadius = circle
    ? '50%'
    : borderRadius !== undefined
      ? typeof borderRadius === 'number'
        ? `${borderRadius}px`
        : borderRadius
      : 'var(--radius-sm)'

  return (
    <div
      aria-hidden="true"
      style={{
        width: typeof width === 'number' ? `${width}px` : width || '100%',
        height: typeof height === 'number' ? `${height}px` : height || '1rem',
        borderRadius: computedBorderRadius,
        backgroundColor: 'var(--color-warm-white-subtle)',
        backgroundImage:
          'linear-gradient(90deg, rgba(218, 217, 214, 0.4) 0%, rgba(246, 245, 242, 0.8) 50%, rgba(218, 217, 214, 0.4) 100%)',
        backgroundSize: '200% 100%',
        animation: 'hs-skeleton-shimmer 1.8s ease-in-out infinite',
        ...style,
      }}
      className={`hs-skeleton ${className}`}
      {...props}
    />
  )
}
