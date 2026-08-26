import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageContainer } from '@/components/layout/PageContainer'

describe('PageContainer Component', () => {
  it('renders children with default xl maxWidth and md padding', () => {
    render(
      <PageContainer>
        <div>Content Inside Container</div>
      </PageContainer>
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('Content Inside Container')).toBeInTheDocument()
  })

  it('applies custom maxWidth and padding classes', () => {
    render(
      <PageContainer maxWidth="sm" padding="lg">
        <div>Custom Size Content</div>
      </PageContainer>
    )

    const main = screen.getByRole('main')
    expect(main).toHaveClass('hs-page-container-sm')
  })
})
