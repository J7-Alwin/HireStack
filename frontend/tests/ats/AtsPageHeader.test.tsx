import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AtsPageHeader } from '@/components/ats/AtsPageHeader'
import { Button, Badge } from '@/components/ui'

describe('AtsPageHeader Component', () => {
  it('renders title, subtitle, badge, and action slots', () => {
    render(
      <AtsPageHeader
        title="Job Requisitions"
        subtitle="Manage and publish job requisitions across departments."
        badge={<Badge variant="accent">3 Open</Badge>}
        primaryAction={<Button variant="primary">Create Job</Button>}
        secondaryActions={<Button variant="outline">Export</Button>}
      />
    )

    expect(screen.getByText('Job Requisitions')).toBeInTheDocument()
    expect(
      screen.getByText('Manage and publish job requisitions across departments.')
    ).toBeInTheDocument()
    expect(screen.getByText('3 Open')).toBeInTheDocument()
    expect(screen.getByText('Create Job')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
  })
})
