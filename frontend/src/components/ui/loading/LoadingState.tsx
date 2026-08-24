import { type ReactNode } from 'react'
import { Spinner, type SpinnerSize } from './Spinner'

export interface LoadingStateProps {
  readonly message?: string
  readonly size?: SpinnerSize
  readonly icon?: ReactNode
  readonly minHeight?: string | number
}

export function LoadingState({
  message = 'Loading...',
  size = 'lg',
  icon,
  minHeight = '240px',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}
      className="hs-loading-state"
    >
      {icon ? (
        <div aria-hidden="true">{icon}</div>
      ) : (
        <Spinner size={size} label={message} />
      )}
      {message && (
        <p
          style={{
            fontSize: 'var(--text-body-sm)',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}
