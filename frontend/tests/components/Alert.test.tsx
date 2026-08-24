import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Alert } from '@/components/ui/alert'

describe('Alert Component', () => {
  it('renders title, content, and accessible alert role for error', () => {
    render(
      <Alert variant="error" title="Submission Error">
        Please check highlighted fields.
      </Alert>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Submission Error')).toBeInTheDocument()
    expect(screen.getByText('Please check highlighted fields.')).toBeInTheDocument()
  })

  it('renders status role for info alert and handles dismiss', () => {
    const handleClose = vi.fn()
    render(
      <Alert variant="info" title="System Notice" onClose={handleClose}>
        Maintenance scheduled at 2:00 AM.
      </Alert>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()

    const dismissBtn = screen.getByLabelText(/dismiss alert/i)
    fireEvent.click(dismissBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
