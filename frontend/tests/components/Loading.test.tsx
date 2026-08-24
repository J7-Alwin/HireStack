import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner, LoadingState } from '@/components/ui/loading'
import { Skeleton } from '@/components/ui/skeleton'

describe('Loading Components', () => {
  it('renders Spinner with accessible role status', () => {
    render(<Spinner label="Fetching applications..." />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Fetching applications...')
  })

  it('renders LoadingState with message', () => {
    render(<LoadingState message="Loading candidates..." />)

    const matches = screen.getAllByText('Loading candidates...')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Skeleton with aria-hidden', () => {
    const { container } = render(<Skeleton width={200} height={20} />)

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstChild).toHaveClass('hs-skeleton')
  })
})
