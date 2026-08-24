import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Pagination } from '@/components/ui/pagination'

describe('Pagination Component', () => {
  it('renders pagination buttons and handles page change', () => {
    const handlePageChange = vi.fn()
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={handlePageChange}
      />
    )

    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument()
    expect(screen.getByText(/showing 11 to 20 of 50 results/i)).toBeInTheDocument()

    const page3Btn = screen.getByRole('button', { name: 'Page 3' })
    fireEvent.click(page3Btn)
    expect(handlePageChange).toHaveBeenCalledWith(3)

    const prevBtn = screen.getByRole('button', { name: /previous page/i })
    fireEvent.click(prevBtn)
    expect(handlePageChange).toHaveBeenCalledWith(1)

    const nextBtn = screen.getByRole('button', { name: /next page/i })
    fireEvent.click(nextBtn)
    expect(handlePageChange).toHaveBeenCalledWith(3)
  })

  it('disables previous button on first page and next button on last page', () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
    )

    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next page/i })).not.toBeDisabled()

    rerender(<Pagination currentPage={3} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /previous page/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
  })
})
