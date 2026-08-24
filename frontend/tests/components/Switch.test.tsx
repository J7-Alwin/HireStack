import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Switch } from '@/components/ui/switch'

describe('Switch Component', () => {
  it('renders switch with role and aria-checked', () => {
    const handleToggle = vi.fn()
    render(<Switch label="Enable Notifications" checked={false} onCheckedChange={handleToggle} />)

    const switchBtn = screen.getByRole('switch', { name: /enable notifications/i })
    expect(switchBtn).toBeInTheDocument()
    expect(switchBtn).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(switchBtn)
    expect(handleToggle).toHaveBeenCalledWith(true)
  })

  it('reflects checked state when true', () => {
    render(<Switch label="Active Status" checked={true} />)

    const switchBtn = screen.getByRole('switch', { name: /active status/i })
    expect(switchBtn).toHaveAttribute('aria-checked', 'true')
  })

  it('does not toggle when disabled', () => {
    const handleToggle = vi.fn()
    render(<Switch label="Disabled switch" disabled onCheckedChange={handleToggle} />)

    const switchBtn = screen.getByRole('switch', { name: /disabled switch/i })
    expect(switchBtn).toBeDisabled()

    fireEvent.click(switchBtn)
    expect(handleToggle).not.toHaveBeenCalled()
  })
})
