import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Dialog, ConfirmationDialog } from '@/components/ui/dialog'

describe('Dialog Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Dialog isOpen={false} onClose={() => {}} title="Test Dialog">
        Dialog content
      </Dialog>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders title, description, content, and handles close button', () => {
    const handleClose = vi.fn()
    render(
      <Dialog
        isOpen={true}
        onClose={handleClose}
        title="Schedule Interview"
        description="Select date and time"
      >
        <p>Form inside modal</p>
      </Dialog>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Schedule Interview')).toBeInTheDocument()
    expect(screen.getByText('Select date and time')).toBeInTheDocument()
    expect(screen.getByText('Form inside modal')).toBeInTheDocument()

    const closeBtn = screen.getByLabelText(/close dialog/i)
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('closes when Escape key is pressed', () => {
    const handleClose = vi.fn()
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Escape Test">
        Content
      </Dialog>
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('renders ConfirmationDialog with cancel and confirm actions', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Candidate"
        description="Are you sure you want to delete this candidate?"
        confirmLabel="Yes, Delete"
        isDestructive
      />
    )

    expect(screen.getByText('Delete Candidate')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this candidate?')).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /yes, delete/i })
    fireEvent.click(confirmBtn)
    expect(handleConfirm).toHaveBeenCalledTimes(1)

    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
