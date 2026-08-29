import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AtsConfirmDialog } from '@/components/ats/AtsConfirmDialog'

describe('AtsConfirmDialog Component', () => {
  it('renders confirmation title, description, and handles confirm action', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    render(
      <AtsConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Candidate"
        description="Are you sure you want to remove this candidate profile?"
        confirmLabel="Yes, Delete"
        variant="danger"
      />
    )

    expect(screen.getByText('Delete Candidate')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to remove this candidate profile?')
    ).toBeInTheDocument()

    const confirmBtn = screen.getByText('Yes, Delete')
    fireEvent.click(confirmBtn)
    expect(handleConfirm).toHaveBeenCalledTimes(1)

    const cancelBtn = screen.getByText('Cancel')
    fireEvent.click(cancelBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
