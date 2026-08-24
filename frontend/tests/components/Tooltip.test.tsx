import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Tooltip } from '@/components/ui/tooltip'

describe('Tooltip Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows tooltip on mouse enter after delay and hides on mouse leave', () => {
    render(
      <Tooltip content="Helpful tooltip text" delay={100}>
        <button type="button">Hover me</button>
      </Tooltip>
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    const trigger = screen.getByRole('button', { name: /hover me/i })
    fireEvent.mouseEnter(trigger)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful tooltip text')

    fireEvent.mouseLeave(trigger)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
