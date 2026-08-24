import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Avatar } from '@/components/ui/avatar'

describe('Avatar Component', () => {
  it('renders initials from full name when no image is provided', () => {
    render(<Avatar name="Sarah Connor" />)

    expect(screen.getByText('SC')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /sarah connor/i })).toBeInTheDocument()
  })

  it('renders single initial for single name', () => {
    render(<Avatar name="HireStack" />)

    expect(screen.getByText('HI')).toBeInTheDocument()
  })

  it('renders image when src is supplied', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Alex Rivera" />)

    const img = screen.getByRole('img', { name: /alex rivera/i })
    expect(img).toBeInTheDocument()
  })
})
