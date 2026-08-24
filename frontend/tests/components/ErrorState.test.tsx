import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ErrorState } from '@/components/ui/error-state'

describe('ErrorState Component', () => {
  it('renders title, description, and triggers retry callback', () => {
    const handleRetry = vi.fn()
    render(
      <ErrorState
        title="Failed to load job listings"
        description="Network request timed out."
        onRetry={handleRetry}
        retryLabel="Retry Request"
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to load job listings')).toBeInTheDocument()
    expect(screen.getByText('Network request timed out.')).toBeInTheDocument()

    const retryBtn = screen.getByRole('button', { name: /retry request/i })
    fireEvent.click(retryBtn)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })
})
