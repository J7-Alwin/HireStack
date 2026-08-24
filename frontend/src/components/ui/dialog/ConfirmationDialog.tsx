import { type ReactNode } from 'react'
import { Dialog } from './Dialog'
import { Button } from '../button'

export interface ConfirmationDialogProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: () => void
  readonly title: string
  readonly description: string
  readonly confirmLabel?: string
  readonly cancelLabel?: string
  readonly isDestructive?: boolean
  readonly isLoading?: boolean
  readonly icon?: ReactNode
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  icon,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      size="sm"
      showCloseButton={!isLoading}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isDestructive ? 'var(--color-error-bg)' : 'var(--color-warm-white-subtle)',
              color: isDestructive ? 'var(--color-error)' : 'var(--color-charcoal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${isDestructive ? 'var(--color-error-border)' : 'var(--color-border)'}`,
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        <div>
          <h3
            style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: '0 0 6px 0',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 'var(--leading-normal)',
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-2)',
          }}
        >
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
