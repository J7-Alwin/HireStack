import { Dialog, Button } from '@/components/ui'

export interface AtsConfirmDialogProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: () => void | Promise<void>
  readonly title: string
  readonly description: string
  readonly confirmLabel?: string
  readonly cancelLabel?: string
  readonly variant?: 'danger' | 'primary'
  readonly isLoading?: boolean
}

export function AtsConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: AtsConfirmDialogProps) {
  const isDanger = variant === 'danger'

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      description={description}
      size="sm"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          marginTop: 'var(--space-2)',
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            width: '100%',
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
            variant={isDanger ? 'danger' : 'primary'}
            size="md"
            onClick={() => void onConfirm()}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
