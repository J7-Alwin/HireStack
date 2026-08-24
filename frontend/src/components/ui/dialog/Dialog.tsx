import { useEffect, useRef, type ReactNode, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export interface DialogProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly title?: string
  readonly description?: string
  readonly children: ReactNode
  readonly size?: 'sm' | 'md' | 'lg' | 'xl'
  readonly showCloseButton?: boolean
  readonly closeOnBackdropClick?: boolean
  readonly closeOnEscape?: boolean
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const generatedId = useId()
  const titleId = `${generatedId}-title`
  const descriptionId = `${generatedId}-desc`

  // Handle focus trapping and Escape key
  useEffect(() => {
    if (!isOpen) return

    previousActiveElement.current = document.activeElement as HTMLElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return

        const firstElement = focusable[0]
        const lastElement = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Focus the dialog container or first element
    setTimeout(() => {
      dialogRef.current?.focus()
    }, 50)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, onClose, closeOnEscape])

  if (!isOpen) return null

  const sizeWidths: Record<string, string> = {
    sm: '420px',
    md: '540px',
    lg: '720px',
    xl: '900px',
  }

  const dialogContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closeOnBackdropClick ? onClose : undefined}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(43, 43, 43, 0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 'var(--z-modal-backdrop)',
          transition: 'opacity var(--transition-normal)',
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        style={{
          position: 'relative',
          zIndex: 'var(--z-modal)',
          maxWidth: sizeWidths[size],
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          outline: 'none',
        }}
        className="hs-dialog"
      >
        {/* Dialog Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              padding: 'var(--space-6) var(--space-6) var(--space-4)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
            }}
          >
            <div>
              {title && (
                <h2
                  id={titleId}
                  style={{
                    fontSize: 'var(--text-h3)',
                    fontWeight: 600,
                    letterSpacing: 'var(--tracking-tight)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    color: 'var(--color-text-secondary)',
                    marginTop: '4px',
                  }}
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  transition: 'color var(--transition-fast), background-color var(--transition-fast)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            )}
          </div>
        )}

        {/* Dialog Body */}
        <div
          style={{
            padding: '0 var(--space-6) var(--space-6)',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}
