import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Select } from '@/components/ui/select'

describe('Select Component', () => {
  const options = [
    { value: 'eng', label: 'Engineering' },
    { value: 'des', label: 'Design' },
    { value: 'prod', label: 'Product' },
  ]

  it('renders options and responds to selection', () => {
    const handleChange = vi.fn()
    render(<Select label="Department" options={options} onChange={handleChange} />)

    const select = screen.getByLabelText(/department/i)
    expect(select).toBeInTheDocument()

    fireEvent.change(select, { target: { value: 'des' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders error message', () => {
    render(<Select label="Department" options={options} error="Please select a department" />)

    const select = screen.getByLabelText(/department/i)
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a department')
  })
})
