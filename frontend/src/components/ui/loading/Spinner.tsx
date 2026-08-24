import { type HTMLAttributes } from 'react'

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  readonly size?: SpinnerSize
  readonly color?: string
  readonly label?: string
}

export function Spinner({
  size = 'md',
  color = 'var(--color-charcoal)',
  label = 'Loading...',
  className = '',
  style,
  ...props
}: SpinnerProps) {
  const sizeMap: Record<SpinnerSize, number> = {
    sm: 16,
    md: 24,
    lg: 36,
    xl: 48,
  }

  const px = sizeMap[size]
  const strokeWidth = size === 'sm' ? 3 : size === 'xl' ? 2.5 : 3

  return (
    <div
      role="status"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${px}px`,
        height: `${px}px`,
        ...style,
      }}
      className={`hs-spinner hs-spinner-${size} ${className}`}
      {...props}
    >
      <svg
        style={{
          width: '100%',
          height: '100%',
          animation: 'spin 1s linear infinite',
        }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}
