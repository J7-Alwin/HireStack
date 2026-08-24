import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  it('renders text content and variants', () => {
    const { rerender } = render(<Badge variant="neutral">Neutral</Badge>)
    expect(screen.getByText('Neutral')).toBeInTheDocument()

    rerender(<Badge variant="success">Active</Badge>)
    expect(screen.getByText('Active')).toHaveClass('hs-badge-success')

    rerender(<Badge variant="accent" withDot>AI Evaluated</Badge>)
    expect(screen.getByText('AI Evaluated')).toBeInTheDocument()
  })

  it('supports size variants', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small')).toHaveClass('hs-badge-sm')

    rerender(<Badge size="md">Medium</Badge>)
    expect(screen.getByText('Medium')).toHaveClass('hs-badge-md')
  })
})
