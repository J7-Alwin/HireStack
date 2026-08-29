import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AtsDetailHeader } from '@/components/ats/AtsDetailHeader'
import { Button, Badge } from '@/components/ui'

describe('AtsDetailHeader Component', () => {
  it('renders entity title, status badge, tags, and handles back button click', () => {
    const handleBack = vi.fn()

    render(
      <AtsDetailHeader
        title="Alex Mercer"
        subtitle="Lead Systems Architect"
        status="ACTIVE"
        tags={[
          <Badge key="t1" variant="neutral">
            Engineering
          </Badge>,
        ]}
        backLabel="Back to Candidates"
        onBack={handleBack}
        actions={<Button variant="primary">Edit Profile</Button>}
      />
    )

    expect(screen.getByText('Alex Mercer')).toBeInTheDocument()
    expect(screen.getByText('Lead Systems Architect')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()

    const backButton = screen.getByText('Back to Candidates')
    fireEvent.click(backButton)
    expect(handleBack).toHaveBeenCalledTimes(1)
  })
})
