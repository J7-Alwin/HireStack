import { useEffect, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  readonly id: string
  readonly type: ToastType
  readonly title?: string
  readonly message: ReactNode
  readonly duration?: number
}

export interface ToastProps {
  readonly toast: ToastItem
  readonly onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (toast.duration === 0) return

    const duration = toast.duration || 4000
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  const typeIcons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 style={{ width: '18px', height: '18px', color: 'var(--color-success)' }} />,
    error: <AlertCircle style={{ width: '18px', height: '18px', color: 'var(--color-error)' }} />,
    warning: <AlertTriangle style={{ width: '18px', height: '18px', color: 'var(--color-warning)' }} />,
    info: <Info style={{ width: '18px', height: '18px', color: 'var(--color-info)' }} />,
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: '12px 16px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: '300px',
        maxWidth: '420px',
        boxSizing: 'border-box',
        transition: 'all var(--transition-normal)',
      }}
      className={`hs-toast hs-toast-${toast.type}`}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
        {typeIcons[toast.type]}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {toast.title && (
          <h4
            style={{
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {toast.title}
          </h4>
        )}
        <div
          style={{
            fontSize: 'var(--text-caption)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.4,
          }}
        >
          {toast.message}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss toast notification"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <X style={{ width: '14px', height: '14px' }} />
      </button>
    </div>
  )
}
