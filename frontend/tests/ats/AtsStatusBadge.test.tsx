import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AtsStatusBadge } from '@/components/ats/AtsStatusBadge'

describe('AtsStatusBadge Component', () => {
  it('renders mapped label and variant from status prop', () => {
    render(<AtsStatusBadge status="TECHNICAL_INTERVIEW" />)

    expect(screen.getByText('Technical Interview')).toBeInTheDocument()
  })

  it('renders custom label when provided', () => {
    render(<AtsStatusBadge status="ACTIVE" label="Custom Active Status" />)

    expect(screen.getByText('Custom Active Status')).toBeInTheDocument()
  })
})
