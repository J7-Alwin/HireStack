import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SortControl } from '@/components/ui/sort-control'

describe('SortControl Component', () => {
  it('renders label and toggles sort direction on click', () => {
    const handleToggle = vi.fn()
    const { rerender } = render(
      <SortControl label="Created Date" direction={null} onToggle={handleToggle} />
    )

    const btn = screen.getByRole('button', { name: /sort by created date/i })
    expect(btn).toBeInTheDocument()

    fireEvent.click(btn)
    expect(handleToggle).toHaveBeenCalledTimes(1)

    rerender(<SortControl label="Created Date" direction="asc" onToggle={handleToggle} />)
    expect(screen.getByRole('button', { name: /currently ascending/i })).toBeInTheDocument()

    rerender(<SortControl label="Created Date" direction="desc" onToggle={handleToggle} />)
    expect(screen.getByRole('button', { name: /currently descending/i })).toBeInTheDocument()
  })
})
