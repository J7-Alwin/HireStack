import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

describe('Card Component', () => {
  it('renders all card subcomponents correctly', () => {
    render(
      <Card variant="default">
        <CardHeader>
          <CardTitle>Job Statistics</CardTitle>
          <CardDescription>Overview of active job listings</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card body content</p>
        </CardContent>
        <CardFooter>
          <button type="button">Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Job Statistics')).toBeInTheDocument()
    expect(screen.getByText('Overview of active job listings')).toBeInTheDocument()
    expect(screen.getByText('Card body content')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('renders dark and accent variants', () => {
    const { container, rerender } = render(<Card variant="dark">Dark card</Card>)
    expect(container.firstChild).toHaveClass('hs-card-dark')

    rerender(<Card variant="accent">Accent card</Card>)
    expect(container.firstChild).toHaveClass('hs-card-accent')
  })
})
