import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders label and connects to input via htmlFor', () => {
    render(<Input label="Email Address" placeholder="you@example.com" />)

    const input = screen.getByLabelText(/email address/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'you@example.com')
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input label="Search" onChange={handleChange} />)

    const input = screen.getByLabelText(/search/i)
    fireEvent.change(input, { target: { value: 'Frontend Developer' } })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders error message and sets aria-invalid', () => {
    render(<Input label="Password" error="Password is required" />)

    const input = screen.getByLabelText(/password/i)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Password is required')
  })

  it('renders helper text when no error exists', () => {
    render(<Input label="Username" helperText="Must be unique" />)

    expect(screen.getByText('Must be unique')).toBeInTheDocument()
  })

  it('disables input when disabled prop is true', () => {
    render(<Input label="Disabled Field" disabled />)

    expect(screen.getByLabelText(/disabled field/i)).toBeDisabled()
  })
})
