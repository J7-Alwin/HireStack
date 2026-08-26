import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

describe('Breadcrumbs Component', () => {
  it('renders breadcrumb derived from route pathname', () => {
    render(
      <MemoryRouter initialEntries={['/app/candidates']}>
        <Breadcrumbs />
      </MemoryRouter>
    )

    expect(screen.getByRole('navigation', { name: /Breadcrumb/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Overview/i })).toBeInTheDocument()
    expect(screen.getByText('Candidates')).toBeInTheDocument()
  })

  it('renders custom breadcrumb items when passed explicitly', () => {
    render(
      <MemoryRouter>
        <Breadcrumbs
          items={[
            { label: 'Jobs', href: '/app/jobs' },
            { label: 'Frontend Engineer' },
          ]}
        />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /Jobs/i })).toBeInTheDocument()
    const activeItem = screen.getByText('Frontend Engineer')
    expect(activeItem).toBeInTheDocument()
    expect(activeItem).toHaveAttribute('aria-current', 'page')
  })
})
