import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Dropdown } from '@/components/ui/dropdown'

describe('Dropdown Component', () => {
  const items = [
    { id: '1', label: 'View Profile', onClick: vi.fn() },
    { id: '2', label: 'Edit Candidate', onClick: vi.fn() },
    { id: '3', label: 'divider', isDivider: true },
    { id: '4', label: 'Delete', isDanger: true, onClick: vi.fn() },
  ]

  it('opens menu on trigger click and executes item action', () => {
    render(<Dropdown trigger={<button type="button">Actions</button>} items={items} />)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    const trigger = screen.getByRole('button', { name: /actions/i })
    fireEvent.click(trigger)

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('View Profile')).toBeInTheDocument()
    expect(screen.getByText('Edit Candidate')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()

    const deleteBtn = screen.getByText('Delete')
    fireEvent.click(deleteBtn)

    expect(items[3].onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes on Escape key', () => {
    render(<Dropdown trigger={<button type="button">Actions</button>} items={items} />)

    const trigger = screen.getByRole('button', { name: /actions/i })
    fireEvent.click(trigger)

    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
