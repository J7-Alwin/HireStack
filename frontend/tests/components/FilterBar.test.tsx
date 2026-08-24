import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FilterBar } from '@/components/ui/filter-bar'

describe('FilterBar Component', () => {
  it('renders filter bar children and active count badge', () => {
    const handleClearAll = vi.fn()
    render(
      <FilterBar activeCount={3} onClearAll={handleClearAll}>
        <input placeholder="Filter by status" />
      </FilterBar>
    )

    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter by status')).toBeInTheDocument()

    const clearBtn = screen.getByRole('button', { name: /clear filters/i })
    fireEvent.click(clearBtn)
    expect(handleClearAll).toHaveBeenCalledTimes(1)
  })
})
