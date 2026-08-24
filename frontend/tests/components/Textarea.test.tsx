import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea Component', () => {
  it('renders label and supports value changes', () => {
    const handleChange = vi.fn()
    render(<Textarea label="Job Description" onChange={handleChange} />)

    const textarea = screen.getByLabelText(/job description/i)
    expect(textarea).toBeInTheDocument()

    fireEvent.change(textarea, { target: { value: 'Looking for a Senior React Engineer...' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders error message and aria-invalid', () => {
    render(<Textarea label="Bio" error="Bio cannot exceed 500 characters" />)

    const textarea = screen.getByLabelText(/bio/i)
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Bio cannot exceed 500 characters')
  })
})
