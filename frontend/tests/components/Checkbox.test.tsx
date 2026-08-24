import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox Component', () => {
  it('renders label and toggles checked state', () => {
    const handleChange = vi.fn()
    render(<Checkbox label="I agree to terms" onChange={handleChange} />)

    const checkbox = screen.getByLabelText(/i agree to terms/i)
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders checked state when checked prop is true', () => {
    render(<Checkbox label="Remember me" checked readOnly />)

    expect(screen.getByLabelText(/remember me/i)).toBeChecked()
  })

  it('handles disabled state', () => {
    const handleChange = vi.fn()
    render(<Checkbox label="Disabled option" disabled onChange={handleChange} />)

    const checkbox = screen.getByLabelText(/disabled option/i)
    expect(checkbox).toBeDisabled()

    fireEvent.click(checkbox)
    expect(handleChange).not.toHaveBeenCalled()
  })
})
