import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SearchInput } from '@/components/ui/search-input'

describe('SearchInput Component', () => {
  it('renders input, handles typing, and shows clear button', () => {
    const handleChange = vi.fn()
    const handleClear = vi.fn()

    const { rerender } = render(
      <SearchInput
        value=""
        onChange={handleChange}
        placeholder="Search candidates..."
        onClear={handleClear}
      />
    )

    const input = screen.getByPlaceholderText('Search candidates...')
    fireEvent.change(input, { target: { value: 'Frontend' } })
    expect(handleChange).toHaveBeenCalledWith('Frontend')

    rerender(
      <SearchInput
        value="Frontend"
        onChange={handleChange}
        placeholder="Search candidates..."
        onClear={handleClear}
      />
    )

    const clearBtn = screen.getByLabelText(/clear search/i)
    expect(clearBtn).toBeInTheDocument()

    fireEvent.click(clearBtn)
    expect(handleChange).toHaveBeenCalledWith('')
    expect(handleClear).toHaveBeenCalledTimes(1)
  })

  it('shows loading indicator when isLoading is true', () => {
    render(<SearchInput value="test" onChange={() => {}} isLoading={true} />)

    expect(screen.getByLabelText(/searching/i)).toBeInTheDocument()
  })
})
