import { useState, useCallback, useMemo, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Toast, type ToastItem } from './Toast'
import { ToastContext, type ToastContextValue, type ToastOptions } from './toast-context'

export interface ToastProviderProps {
  readonly children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }: ToastOptions): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const newToast: ToastItem = { id, title, message, type, duration }
      setToasts((prev) => [...prev, newToast])
      return id
    },
    []
  )

  const success = useCallback(
    (message: ReactNode, title?: string) => showToast({ type: 'success', title, message }),
    [showToast]
  )

  const error = useCallback(
    (message: ReactNode, title?: string) => showToast({ type: 'error', title, message }),
    [showToast]
  )

  const warning = useCallback(
    (message: ReactNode, title?: string) => showToast({ type: 'warning', title, message }),
    [showToast]
  )

  const info = useCallback(
    (message: ReactNode, title?: string) => showToast({ type: 'info', title, message }),
    [showToast]
  )

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismissToast,
      success,
      error,
      warning,
      info,
    }),
    [showToast, dismissToast, success, error, warning, info]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-live="polite"
            style={{
              position: 'fixed',
              bottom: 'var(--space-6)',
              right: 'var(--space-6)',
              zIndex: 'var(--z-toast)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              pointerEvents: 'none',
            }}
          >
            {toasts.map((toast) => (
              <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                <Toast toast={toast} onDismiss={dismissToast} />
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}
