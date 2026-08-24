import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ToastProvider, useToast } from '@/components/ui/toast'

function ToastTrigger() {
  const toast = useToast()

  return (
    <div>
      <button
        type="button"
        onClick={() => toast.success('Candidate created successfully', 'Created')}
      >
        Trigger Success
      </button>
      <button
        type="button"
        onClick={() => toast.error('Failed to submit application', 'Error')}
      >
        Trigger Error
      </button>
    </div>
  )
}

describe('Toast System', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders and displays toast notification on trigger', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )

    const trigger = screen.getByRole('button', { name: /trigger success/i })
    fireEvent.click(trigger)

    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Candidate created successfully')).toBeInTheDocument()
  })

  it('auto-dismisses toast after duration', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )

    const trigger = screen.getByRole('button', { name: /trigger error/i })
    fireEvent.click(trigger)

    expect(screen.getByText('Error')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.queryByText('Error')).not.toBeInTheDocument()
  })

  it('dismisses toast when clicking close button', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )

    const trigger = screen.getByRole('button', { name: /trigger success/i })
    fireEvent.click(trigger)

    const dismissBtn = screen.getByLabelText(/dismiss toast notification/i)
    fireEvent.click(dismissBtn)

    expect(screen.queryByText('Created')).not.toBeInTheDocument()
  })
})
