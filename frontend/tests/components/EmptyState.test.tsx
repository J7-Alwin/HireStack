import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EmptyState } from '@/components/ui/empty-state'

describe('EmptyState Component', () => {
  it('renders title, description, and optional action', () => {
    const handleAction = vi.fn()
    render(
      <EmptyState
        title="No candidates found"
        description="Try adjusting your filters or search keywords."
        action={<button type="button" onClick={handleAction}>Add Candidate</button>}
      />
    )

    expect(screen.getByText('No candidates found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters or search keywords.')).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /add candidate/i })
    fireEvent.click(button)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })
})
